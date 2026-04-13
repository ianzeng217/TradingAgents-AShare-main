import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

const DATA_FIELD_LABELS: Record<string, string> = {
    stock_data: 'K线',
    indicators: '技术指标',
    vpa_indicators: '量价',
    fundamentals: '基本面',
    balance_sheet: '资产负债',
    cashflow: '现金流',
    income_statement: '利润表',
    news: '个股新闻',
    global_news: '全球新闻',
    fund_flow_board: '板块资金',
    fund_flow_individual: '个股资金',
    lhb: '龙虎榜',
    insider_transactions: '大单',
    zt_pool: '涨停池',
    hot_stocks: '热门榜',
}

const ALL_FIELD_KEYS = Object.keys(DATA_FIELD_LABELS)

export interface AgentStep {
    name: string
    label: string
    status: 'pending' | 'running' | 'done' | 'skipped'
    horizon?: string
}

export interface ProgressInfo {
    phase: 'collecting' | 'analyzing' | 'done'
    symbol?: string
    collectedFields: string[]
    agentSteps: AgentStep[]
}

export default function AnalysisProgressPanel({ info }: { info: ProgressInfo }) {
    const isCollecting = info.phase === 'collecting'
    const hasAgents = info.agentSteps.length > 0

    return (
        <div className="mt-2 mb-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 px-3 py-2.5 text-xs shrink-0 space-y-2.5">
            {/* 数据采集 */}
            <div>
                <div className="flex items-center gap-1.5 mb-1.5 font-medium">
                    {isCollecting ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin text-cyan-500 shrink-0" />
                            <span className="text-cyan-600 dark:text-cyan-400">正在采集行情数据…</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="text-emerald-600 dark:text-emerald-400">
                                数据采集完成
                                {info.symbol && <span className="ml-1 text-slate-400 font-normal">· {info.symbol}</span>}
                            </span>
                        </>
                    )}
                </div>
                <div className="flex flex-wrap gap-1">
                    {ALL_FIELD_KEYS.map((key) => {
                        const collected = info.collectedFields.includes(key)
                        return (
                            <span
                                key={key}
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] transition-all duration-300 ${
                                    collected
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                                        : isCollecting
                                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 animate-pulse'
                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}
                            >
                                {collected && <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />}
                                {DATA_FIELD_LABELS[key]}
                            </span>
                        )
                    })}
                </div>
            </div>

            {/* 智能体分析进度 */}
            {hasAgents && (
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5 font-medium text-slate-500 dark:text-slate-400">
                        <span>智能体分析</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {info.agentSteps.map((step, i) => {
                            const horizonTag =
                                step.horizon === 'short' ? '短' : step.horizon === 'medium' ? '中' : ''
                            return (
                                <span
                                    key={`${step.name}-${step.horizon || 'main'}-${i}`}
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] transition-all duration-300 ${
                                        step.status === 'done' || step.status === 'skipped'
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                                            : step.status === 'running'
                                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
                                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                    }`}
                                >
                                    {step.status === 'running' && (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                                    )}
                                    {(step.status === 'done' || step.status === 'skipped') && (
                                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                                    )}
                                    {step.status === 'pending' && (
                                        <Circle className="w-2.5 h-2.5 shrink-0" />
                                    )}
                                    {step.label}
                                    {horizonTag && (
                                        <span className="opacity-60">({horizonTag})</span>
                                    )}
                                </span>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
