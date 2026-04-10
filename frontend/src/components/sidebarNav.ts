import type { LucideIcon } from 'lucide-react'
import {
    Activity,
    Briefcase,
    FileText,
    Wallet,
} from 'lucide-react'

export interface SidebarNavItem {
    path: string
    icon: LucideIcon
    label: string
}

export const navItems: SidebarNavItem[] = [
    { path: '/analysis', icon: Activity, label: '投研分析' },
    { path: '/reports', icon: FileText, label: '研究报告' },
    { path: '/portfolio', icon: Briefcase, label: '自选组合' },
    { path: '/tracking-board', icon: Wallet, label: '持仓追踪' },
]
