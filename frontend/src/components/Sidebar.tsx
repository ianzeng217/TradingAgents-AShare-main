import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

import { navItems } from '@/components/sidebarNav'

const buildDate = __APP_BUILD_DATE__
const buildCommit = __APP_BUILD_COMMIT__
const buildVersion = __APP_BUILD_VERSION__

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-700 flex flex-col z-50 transition-all duration-300 ${isExpanded ? 'w-48' : 'w-16'
                }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-700 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    {isExpanded && (
                        <span className="font-bold text-sm text-slate-200 tracking-tight whitespace-nowrap">
                            TradingAgents
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 ${isActive
                                ? 'bg-slate-800 text-blue-400 border-l-2 border-blue-500 pl-[10px]'
                                : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 border-l-2 border-transparent pl-[10px]'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && (
                            <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-700">
                {isExpanded ? (
                    <div className="text-xs text-slate-500 text-center">
                        <p className="text-slate-300 text-xs font-semibold tracking-wide uppercase">TradingAgents</p>
                        <p className="mt-0.5 text-slate-500">多智能体投研系统</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-400">{buildVersion}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{buildDate} · {buildCommit}</p>
                    </div>
                ) : (
                    <div className="text-[10px] text-slate-500 text-center font-mono">{buildCommit}</div>
                )}
            </div>
        </aside>
    )
}
