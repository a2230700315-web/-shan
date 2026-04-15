import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  ListOrdered,
  MessageSquareWarning,
  FileSpreadsheet,
  Mail,
  Megaphone,
  Users,
  Shield,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import { cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '../routes'

const nav = [
  { to: ADMIN_ROUTES.dashboard, end: true, label: '工作台', icon: LayoutDashboard },
  { to: ADMIN_ROUTES.providers, label: '服务商审核', icon: Building2 },
  { to: ADMIN_ROUTES.orders, label: '全局订单', icon: ListOrdered },
  { to: ADMIN_ROUTES.complaints, label: '投诉工单', icon: MessageSquareWarning },
  { to: ADMIN_ROUTES.reports, label: '报表导出', icon: FileSpreadsheet },
  { to: ADMIN_ROUTES.messageTemplates, label: '消息模板', icon: Mail },
  { to: ADMIN_ROUTES.promotions, label: '推广管理', icon: Megaphone },
  { to: ADMIN_ROUTES.users, label: '用户管理', icon: Users },
  { to: ADMIN_ROUTES.system, label: '系统与审计', icon: Shield },
]

export function AdminLayout() {
  const { session, logout } = useAdminConsole()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-900/80 flex flex-col">
        <div className="p-5 border-b border-zinc-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">闪吊 · 运营后台</div>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            独立登录入口与权限模型，与服务商端（/orders 等）会话隔离，仅平台运营人员使用。
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800 text-[10px] text-zinc-600">
          模拟独立域名：admin.shandiao.com
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6">
          <div className="text-sm text-zinc-400 truncate">
            当前路由：<span className="text-zinc-200 font-mono">{location.pathname}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-zinc-100">{session?.displayName}</div>
              <div className="text-[11px] text-zinc-500">
                {session?.role === 'super_admin' ? '超级管理员' : '运营管理员'} · {session?.username}
              </div>
            </div>
            <Link to="/" className="text-xs text-zinc-500 hover:text-amber-300 transition-colors">
              返回用户端首页
            </Link>
            <Button type="button" variant="outline" size="sm" className="border-zinc-600 text-zinc-200" onClick={logout}>
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              退出
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
