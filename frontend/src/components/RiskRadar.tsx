import { AlertTriangle, Shield, AlertCircle } from 'lucide-react'
import type { RiskItem } from '@/types'

const LEVEL_CONFIG = {
    high: { color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', label: '高', icon: AlertTriangle },
    medium: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', label: '中', icon: AlertCircle },
    low: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', label: '低', icon: Shield },
}

export default function RiskRadar({ items }: { items?: RiskItem[] }) {
    const risks: RiskItem[] = items ?? []

    return (
        <div className="card">
            <div className="section-header">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="fin-label">风险评估</h3>
            </div>

            {risks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Shield className="w-7 h-7 text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-600">分析完成后展示风险评估</p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {risks.map((risk, i) => {
                        const config = LEVEL_CONFIG[risk.level]
                        const Icon = config.icon
                        return (
                            <div
                                key={i}
                                className="flex items-start gap-2.5 py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                            >
                                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.color}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{risk.name}</span>
                                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${config.color} ${config.bg} ${config.border}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    {risk.description && (
                                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-500 line-clamp-2 leading-relaxed">{risk.description}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
