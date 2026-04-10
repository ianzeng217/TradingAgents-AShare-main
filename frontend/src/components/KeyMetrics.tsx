import { BarChart3 } from 'lucide-react'
import type { KeyMetric } from '@/types'

const STATUS_STYLE = {
    good: 'text-rose-500 dark:text-rose-400 font-bold',
    neutral: 'text-slate-600 dark:text-slate-300 font-medium',
    bad: 'text-emerald-600 dark:text-emerald-400 font-bold',
}

export default function KeyMetrics({ items }: { items?: KeyMetric[] }) {
    const metrics: KeyMetric[] = items ?? []

    return (
        <div className="card">
            <div className="section-header">
                <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="fin-label">关键指标</h3>
            </div>

            {metrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BarChart3 className="w-7 h-7 text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-600">分析完成后展示关键指标</p>
                </div>
            ) : (
                <div>
                    {metrics.map((metric) => (
                        <div key={metric.name} className="data-row">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{metric.name}</span>
                            <span className={`text-xs tabular-nums ${STATUS_STYLE[metric.status]}`}>
                                {metric.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
