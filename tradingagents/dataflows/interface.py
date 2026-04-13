import os
import threading

from .alpha_vantage_common import AlphaVantageRateLimitError
from .config import get_config
from .providers import build_default_registry

# Default per-provider call timeout (seconds). Override via config key "provider_timeout".
_DEFAULT_PROVIDER_TIMEOUT = 15


def _call_with_timeout(func, args, kwargs, timeout: float):
    """Run func(*args, **kwargs) in a daemon thread; raise TimeoutError if it exceeds timeout."""
    result = [None]
    exc = [None]

    def _target():
        try:
            result[0] = func(*args, **kwargs)
        except Exception as e:
            exc[0] = e

    t = threading.Thread(target=_target, daemon=True)
    t.start()
    t.join(timeout)

    if t.is_alive():
        raise TimeoutError(f"timed out after {timeout}s")
    if exc[0] is not None:
        raise exc[0]
    return result[0]


def _call_with_retry(func, args, kwargs, timeout: float, max_retries: int):
    """Call with timeout, retrying up to max_retries times on TimeoutError."""
    last_exc: Exception = TimeoutError()
    for attempt in range(max_retries + 1):
        try:
            return _call_with_timeout(func, args, kwargs, timeout)
        except TimeoutError as e:
            last_exc = e
            if attempt < max_retries:
                print(f"[provider-retry] attempt {attempt + 1}/{max_retries + 1} timed out, retrying...", flush=True)
    raise last_exc

# Tools organized by category
TOOLS_CATEGORIES = {
    "core_stock_apis": {
        "description": "OHLCV stock price data",
        "tools": ["get_stock_data"],
    },
    "technical_indicators": {
        "description": "Technical analysis indicators",
        "tools": ["get_indicators"],
    },
    "fundamental_data": {
        "description": "Company fundamentals",
        "tools": [
            "get_fundamentals",
            "get_balance_sheet",
            "get_cashflow",
            "get_income_statement",
        ],
    },
    "news_data": {
        "description": "News and insider data",
        "tools": [
            "get_news",
            "get_global_news",
            "get_insider_transactions",
        ],
    },
    "realtime_data": {
        "description": "Real-time market quotes",
        "tools": ["get_realtime_quotes"],
    },
    "cn_market_data": {
        "description": "China A-share market sentiment and fund flow data",
        "tools": [
            "get_board_fund_flow",
            "get_individual_fund_flow",
            "get_lhb_detail",
            "get_zt_pool",
            "get_hot_stocks_xq",
        ],
    },
}

_registry = build_default_registry()

VENDOR_LIST = _registry.list_names()


def _is_trace_enabled() -> bool:
    env_value = os.getenv("TA_TRACE")
    if env_value is not None:
        return env_value.strip().lower() in ("1", "true", "yes", "on")

    config = get_config()
    return bool(config.get("provider_trace", True))


def _trace(msg: str) -> None:
    if _is_trace_enabled():
        print(f"[provider-trace] {msg}", flush=True)


def get_category_for_method(method: str) -> str:
    """Get the category that contains the specified method."""
    for category, info in TOOLS_CATEGORIES.items():
        if method in info["tools"]:
            return category
    raise ValueError(f"Method '{method}' not found in any category")


def get_vendor(category: str, method: str = None) -> str:
    """Get configured vendor for category or tool method."""
    config = get_config()

    if method:
        tool_vendors = config.get("tool_vendors", {})
        if method in tool_vendors:
            return tool_vendors[method]

    return config.get("data_vendors", {}).get(category, "yfinance")


def _resolve_vendor_chain(method: str, configured_vendor: str) -> list[str]:
    # Only use explicitly configured vendors.
    # Do NOT silently append all registered providers — unconfigured fallbacks
    # can hang indefinitely on overseas servers (e.g. akshare blocked by GFW).
    return [v.strip() for v in configured_vendor.split(",") if v.strip()]


def route_to_vendor(method: str, *args, **kwargs):
    """Route method calls to provider implementations with fallback support."""
    category = get_category_for_method(method)
    vendor_config = get_vendor(category, method)
    fallback_vendors = _resolve_vendor_chain(method, vendor_config)
    config = get_config()
    timeout = config.get("provider_timeout", _DEFAULT_PROVIDER_TIMEOUT)
    max_retries = config.get("provider_max_retries", 2)
    last_exc = None
    _trace(
        f"method={method} category={category} configured='{vendor_config}' "
        f"chain={fallback_vendors}"
    )

    for vendor in fallback_vendors:
        provider = _registry.get(vendor)
        if provider is None:
            _trace(f"method={method} vendor={vendor} status=skip reason=not-registered")
            continue

        impl_func = getattr(provider, method, None)
        if impl_func is None:
            _trace(f"method={method} vendor={vendor} status=skip reason=not-implemented")
            continue

        try:
            result = _call_with_retry(impl_func, args, kwargs, timeout, max_retries)
            _trace(f"method={method} vendor={vendor} status=hit")
            return result
        except TimeoutError as exc:
            last_exc = exc
            _trace(f"method={method} vendor={vendor} status=fallback reason=timeout(all {max_retries + 1} attempts exceeded {timeout}s)")
            continue
        except (AlphaVantageRateLimitError, NotImplementedError) as exc:
            last_exc = exc
            _trace(
                f"method={method} vendor={vendor} status=fallback "
                f"reason={type(exc).__name__}"
            )
            continue
        except Exception as exc:
            last_exc = exc
            _trace(
                f"method={method} vendor={vendor} status=fallback "
                f"reason={type(exc).__name__}"
            )
            continue

    _trace(f"method={method} status=failed reason=no-available-vendor")
    if last_exc is not None:
        raise RuntimeError(
            f"No available vendor for method '{method}'. "
            f"Configured chain: {fallback_vendors}. "
            f"Last error: {type(last_exc).__name__}: {last_exc}"
        ) from last_exc
    raise RuntimeError(
        f"No available vendor for method '{method}'. "
        f"Configured chain: {fallback_vendors}"
    )
