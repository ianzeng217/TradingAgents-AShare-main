# TradingAgents-AShare：A股智能投研多智能体系统

本项目是基于多智能体协作的 A 股深度分析系统，模拟顶级投研机构的决策闭环，通过 14 名专业 Agent 的多空辩论与风控博弈，为投资者提供结构化的交易建议。

## 安装

```bash
git clone https://github.com/ianzeng217/TradingAgents-AShare-main.git
cd TradingAgents-AShare

# 后端（Python 3.10+）
uv sync

# 前端（Node.js 18+）
cd frontend && npm install && npm run build && cd ..
```

复制 `.env.example` 到 `.env` 并按需修改，然后启动后端：

```bash
uv run python -m uvicorn api.main:app --port 8000
```

访问 http://localhost:8000 开始使用。

## 鸣谢

核心架构灵感与部分基础逻辑源自 [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)。
