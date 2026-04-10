import { TrendingUp, Activity, FileText, CheckCircle, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '@/services/api'
import { useAnalysisStore } from '@/stores/analysisStore'
import { useAuthStore } from '@/stores/authStore'
import type { Report, TrackingBoardResponse } from '@/types'

export default function Dashboard() {
    const { agents, isAnalyzing } = useAnalysisStore()
    const { user } = useAuthStore()
    const [reportTotal, setReportTotal] = useState<number | null>(null)
    const [recentReports, setRecentReports] = useState<Report[]>([])
    const [trackingBoard, setTrackingBoard] = useState<TrackingBoardResponse | null>(null)
    const [dashboardError, setDashboardError] = useState<string | null>(null)
    const navigate = useNavigate()

    const completedAgents = agents.filter(a => a.status === 'completed').length
    const inProgressAgents = agents.filter(a => a.status === 'in_progress').length

    useEffect(() => {
        if (!user?.id) return
        let cancelled = false

        api.getReports(undefined, 0, 5)
            .then(res => {
                if (cancelled) return
                setReportTotal(res.total)
                setRecentReports(res.reports)
            })
            .catch(error => {
                if (cancelled) return
                console.error('Failed to load recent reports:', error)
                setReportTotal(null)
                setDashboardError(prev => prev || (error instanceof Error ? error.message : '加载控制台数据失败'))
            })

        api.getDashboardTrackingBoard()
            .then(res => {
                if (cancelled) return
                setTrackingBoard(res)
            })
            .catch(error => {
                if (cancelled) return
                console.error('Failed to load tracking board summary:', error)
                setTrackingBoard(null)
                setDashboardError(prev => prev || (error instanceof Error ? error.message : '加载跟踪看板摘要失败'))
            })

        return () => {
            cancelled = true
        }
    }, [user?.id])

    return (
        <div className="space-y-6">
            {dashboardError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                    {dashboardError}
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">工作台总览</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        {user?.email ? `当前账户：${user.email}` : 'TradingAgents 多智能体投研决策平台'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Activity}
                    label="智能体状态"
                    value={`${inProgressAgents} 运行中`}
                    subValue={`${completedAgents} 已完成`}
                    color="blue"
                />
                <StatCard
                    icon={CheckCircle}
                    label="当前任务"
                    value={isAnalyzing ? '分析中' : '空闲'}
                    subValue={isAnalyzing ? '请稍候...' : '准备就绪'}
                    color={isAnalyzing ? 'orange' : 'green'}
                />
                <StatCard
                    icon={FileText}
                    label="历史报告"
                    value={reportTotal !== null ? `${reportTotal}` : '-'}
                    subValue="份投研报告"
                    color="purple"
                />
                <StatCard
                    icon={TrendingUp}
                    label="平台状态"
                    value="正常"
                    subValue="各模块运行正常"
                    color="green"
                />
            </div>

            <TrackingBoardSummary
                trackingBoard={trackingBoard}
                onOpen={() => navigate('/tracking-board')}
            />

            <div className="card">
                <h2 className="mb-4 text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300 uppercase pb-3 border-b border-slate-100 dark:border-slate-800/80">快捷入口</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <QuickActionCard
                        title="发起投研分析"
                        description="输入标的代码，调度多智能体协同分析"
                        action="立即分析"
                        onClick={() => navigate('/analysis')}
                    />
                    <QuickActionCard
                        title="查阅历史研报"
                        description="检索并查阅已完成的投研报告"
                        action="进入报告库"
                        onClick={() => navigate('/reports')}
                    />
                    <QuickActionCard
                        title="参数配置"
                        description="配置模型接入与分析参数"
                        action="前往配置"
                        onClick={() => navigate('/settings')}
                    />
                </div>
            </div>

            <div className="card">
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <h2 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300 uppercase">近期研究</h2>
                    {recentReports.length > 0 && (
                        <button
                            onClick={() => navigate('/reports')}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                            全部报告 <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {recentReports.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 dark:text-slate-500">
                        暂无投研记录，
                        <button onClick={() => navigate('/analysis')} className="text-blue-500 hover:underline">
                            发起投研分析
                        </button>
                    </p>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {recentReports.map(report => {
                            const decisionColor = report.decision?.toUpperCase().includes('BUY') || report.decision?.includes('增持')
                                ? 'text-red-600 dark:text-red-400'
                                : report.decision?.toUpperCase().includes('SELL') || report.decision?.includes('减持')
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-slate-500 dark:text-slate-400'
                            return (
                                <div
                                    key={report.id}
                                    className="mx-[-1rem] flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    onClick={() => navigate(`/reports?report=${report.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
                                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{report.name || report.symbol}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{report.trade_date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-medium ${decisionColor}`}>
                                            {report.decision || '-'}
                                        </span>
                                        {report.confidence != null && (
                                            <span className="text-xs text-slate-400">{report.confidence}%</span>
                                        )}
                                        <p className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">
                                            {report.created_at ? new Date(report.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

function TrackingBoardSummary({
    trackingBoard,
    onOpen,
}: {
    trackingBoard: TrackingBoardResponse | null
    onOpen: () => void
}) {
    const itemCount = trackingBoard?.items.length ?? 0
    const quotedCount = trackingBoard?.items.filter(item => item.quote_source).length ?? 0
    const latestQuoteTime = trackingBoard?.items
        .map(item => item.quote_time)
        .filter((value): value is string => Boolean(value))[0] ?? null

    return (
        <div className="card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300 uppercase">持仓追踪摘要</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        当前页仅呈现摘要信息，完整持仓明细、区间表现及操作建议请进入追踪看板查看。
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onOpen}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                    进入追踪看板 <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetaCard
                    label="追踪标的"
                    value={`${itemCount} 只`}
                    subValue={itemCount > 0 ? `共 ${itemCount} 只标的` : '暂未添加标的'}
                />
                <MetaCard
                    label="报价覆盖"
                    value={itemCount > 0 ? `${quotedCount}/${itemCount}` : '--'}
                    subValue={trackingBoard ? `刷新间隔 ${trackingBoard.refresh_interval_seconds}s` : '等待数据同步'}
                />
                <MetaCard
                    label="最近更新"
                    value={formatDashboardTime(latestQuoteTime)}
                    subValue={trackingBoard?.previous_trade_date ? `上一交易日 ${trackingBoard.previous_trade_date}` : '暂无交易日信息'}
                />
                <MetaCard
                    label="追踪状态"
                    value={itemCount > 0 ? '追踪中' : '待配置'}
                    subValue={itemCount > 0 ? '持仓已折叠，进入查看' : '前往追踪看板添加标的'}
                />
            </div>
        </div>
    )
}

function MetaCard({
    label,
    value,
    subValue,
}: {
    label: string
    value: string
    subValue: string
}) {
    return (
        <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0d1526] px-4 py-3">
            <p className="fin-label">{label}</p>
            <p className="mt-2 text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">{subValue}</p>
        </div>
    )
}

function formatDashboardTime(value?: string | null): string {
    if (!value) return '--'
    const parsed = new Date(value.replace(' ', 'T'))
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    subValue: string
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}

function StatCard({ icon: Icon, label, value, subValue, color }: StatCardProps) {
    const accentClasses = {
        blue: 'border-l-blue-500',
        green: 'border-l-emerald-500',
        orange: 'border-l-amber-500',
        purple: 'border-l-violet-500',
        red: 'border-l-rose-500',
    }
    const iconClasses = {
        blue: 'text-blue-400 dark:text-blue-500',
        green: 'text-emerald-400 dark:text-emerald-500',
        orange: 'text-amber-400 dark:text-amber-500',
        purple: 'text-violet-400 dark:text-violet-500',
        red: 'text-rose-400 dark:text-rose-500',
    }

    return (
        <div className={`card card-hover border-l-2 ${accentClasses[color]}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="fin-label">{label}</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 tracking-tight">{value}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subValue}</p>
                </div>
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconClasses[color]}`} />
            </div>
        </div>
    )
}

interface QuickActionCardProps {
    title: string
    description: string
    action: string
    onClick: () => void
}

function QuickActionCard({ title, description, action, onClick }: QuickActionCardProps) {
    return (
        <button
            onClick={onClick}
            className="group block w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0d1526] p-4 text-left transition-all duration-150 hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:shadow-sm"
        >
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 leading-relaxed">{description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                {action} <span>→</span>
            </span>
        </button>
    )
}
