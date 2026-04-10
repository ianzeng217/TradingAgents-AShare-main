import { useState } from 'react'
import { TrendingUp, TrendingDown, Target, Shield, ChevronDown, ChevronUp, Info } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { AnalysisReport } from '@/types'
import { sanitizeReportMarkdown } from '@/utils/reportText'

interface DecisionCardProps {
    symbol: string
    name?: string
    decision?: 'buy' | 'sell' | 'hold' | 'add' | 'reduce' | 'watch'
    direction?: string
    confidence?: number
    targetPrice?: number
    targetChange?: number
    stopLoss?: number
    stopLossChange?: number
    reasoning?: string
    riskLevel?: 'low' | 'medium' | 'high'
    report?: AnalysisReport
}

const decisionConfig: Record<string, { label: string; color: string; icon: typeof TrendingUp }> = {
    buy: { label: '买入', color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30', icon: TrendingUp },
    sell: { label: '卖出', color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30', icon: TrendingDown },
    hold: { label: '持有', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30', icon: Shield },
    add: { label: '增持', color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30', icon: TrendingUp },
    reduce: { label: '减持', color: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30', icon: TrendingDown },
    watch: { label: '观望', color: 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-600', icon: Info },
}

export default function DecisionCard({
    symbol,
    name = symbol,
    decision: propDecision,
    direction,
    confidence,
    targetPrice,
    targetChange,
    stopLoss,
    stopLossChange,
    reasoning,
    riskLevel,
    report,
}: DecisionCardProps) {
    const [expanded, setExpanded] = useState(false)

    const parseDecision = (text?: string): 'buy' | 'sell' | 'hold' | 'add' | 'reduce' | 'watch' | undefined => {
        if (!text) return propDecision
        const lower = text.toLowerCase()
        if (lower.includes('sell') || lower.includes('卖出')) return 'sell'
        if (lower.includes('reduce') || lower.includes('减持')) return 'reduce'
        if (lower.includes('watch') || lower.includes('观望')) return 'watch'
        if (lower.includes('hold') || lower.includes('持有')) return 'hold'
        if (lower.includes('add') || lower.includes('增持')) return 'add'
        if (lower.includes('buy') || lower.includes('买入')) return 'buy'
        return undefined
    }

    const decision = propDecision || parseDecision(report?.decision || report?.final_trade_decision)
    const config = decision ? (decisionConfig[decision] || decisionConfig.hold) : null
    const DecisionIcon = config?.icon

    const riskLabels: Record<string, string> = { low: '低', medium: '中等', high: '高' }
    const riskColors: Record<string, string> = {
        low: 'text-green-600 dark:text-green-400',
        medium: 'text-yellow-600 dark:text-yellow-400',
        high: 'text-red-600 dark:text-red-400',
    }

    return (
        <div className="card overflow-hidden border-l-2 border-l-blue-500/70">
            {/* 头部：标的信息 + 决策徽章 */}
            <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="symbol-badge">{symbol}</span>
                        {direction && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">{direction}</span>
                        )}
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{name !== symbol ? name : '投研决策'}</h3>
                </div>
                {config && DecisionIcon ? (
                    <div className={`px-3 py-1 rounded border text-xs font-bold flex items-center gap-1 ${config.color}`}>
                        <DecisionIcon className="w-3.5 h-3.5" />
                        {config.label}
                    </div>
                ) : (
                    <div className="px-3 py-1 rounded border text-xs font-medium text-slate-400 border-slate-200 dark:border-slate-700">
                        待裁决
                    </div>
                )}
            </div>

            {/* 价格网格 */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5">
                    <div className="fin-label flex items-center gap-1">
                        <Target className="w-3 h-3" />目标价
                    </div>
                    <p className="mt-1.5 text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">
                        {targetPrice != null ? `¥${targetPrice}` : '--'}
                    </p>
                    {targetChange != null && (
                        <p className="text-xs tabular-nums text-rose-500 dark:text-rose-400 font-medium">
                            {targetChange >= 0 ? '+' : ''}{targetChange.toFixed(2)}%
                        </p>
                    )}
                </div>
                <div className="rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5">
                    <div className="fin-label flex items-center gap-1">
                        <Shield className="w-3 h-3" />止损价
                    </div>
                    <p className="mt-1.5 text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {stopLoss != null ? `¥${stopLoss}` : '--'}
                    </p>
                    {stopLossChange != null && (
                        <p className="text-xs tabular-nums text-emerald-500 dark:text-emerald-400 font-medium">
                            {stopLossChange >= 0 ? '+' : ''}{stopLossChange.toFixed(2)}%
                        </p>
                    )}
                </div>
            </div>

            {/* 置信度 */}
            {confidence != null && (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="fin-label">分析置信度</span>
                        <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">{confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                            style={{ width: `${confidence}%` }}
                        />
                    </div>
                </div>
            )}

            {/* 展开详情 */}
            {expanded && (reasoning || riskLevel) && (
                <div className="mb-3 p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    {reasoning && (
                        <div>
                            <span className="fin-label block mb-1">核心逻辑</span>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {sanitizeReportMarkdown(reasoning)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                    {riskLevel && (
                        <div className="data-row">
                            <span className="fin-label">风险等级</span>
                            <span className={`text-xs font-bold ${riskColors[riskLevel]}`}>{riskLabels[riskLevel]}</span>
                        </div>
                    )}
                </div>
            )}

            {/* 操作 */}
            {(reasoning || riskLevel) && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded ? '收起详情' : '展开核心逻辑'}
                </button>
            )}
        </div>
    )
}
