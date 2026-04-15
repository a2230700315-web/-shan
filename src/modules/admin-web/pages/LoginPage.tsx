import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminConsole } from '../context/AdminConsoleContext'
import { ADMIN_ROUTES } from '../routes'

export default function AdminLoginPage() {
  const { session, login } = useAdminConsole()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (session) {
    return <Navigate to={ADMIN_ROUTES.dashboard} replace />
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const ok = login(username, password)
    if (!ok) {
      setError('账号或密码错误。演示账号：super / super123 或 ops / ops123')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wider">独立登录 · 运营专用</span>
          </div>
          <CardTitle className="text-2xl text-zinc-50">闪吊管理后台</CardTitle>
          <CardDescription className="text-zinc-400">
            此入口与服务商端（订单、资源、财务等菜单）权限隔离，不使用同一套角色切换；请使用平台运营账号登录。
          </CardDescription>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-300 transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回首页
          </Link>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">运营账号</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="super 或 ops"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="super123 / ops123"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white">
              登录管理后台
            </Button>
          </form>
          <p className="mt-4 text-[11px] text-zinc-500 leading-relaxed">

          </p>
        </CardContent>
      </Card>
    </div>
  )
}
