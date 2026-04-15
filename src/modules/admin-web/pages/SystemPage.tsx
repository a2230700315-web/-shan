import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminConsole } from '../context/AdminConsoleContext'

const DEMO_ACCOUNTS = [
  { username: 'super', role: '超级管理员', note: '密码 super123' },
  { username: 'ops', role: '运营管理员', note: '密码 ops123' },
]

export default function SystemPage() {
  const { auditLogs } = useAdminConsole()
  const loginLogs = auditLogs.filter((l) => l.action === '登录' || l.action === '登出')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">系统与审计</h1>
        <p className="mt-1 text-sm text-zinc-400">
          运营账号与权限模型（演示）；登录与关键操作写入审计日志，与服务商员工 RBAC 无关。
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">运营账号（演示）</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 pr-4 font-medium">账号</th>
                <th className="pb-3 pr-4 font-medium">角色</th>
                <th className="pb-3 font-medium">说明</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {DEMO_ACCOUNTS.map((a) => (
                <tr key={a.username} className="border-b border-zinc-800/80">
                  <td className="py-3 pr-4 font-mono text-amber-200/90">{a.username}</td>
                  <td className="py-3 pr-4">{a.role}</td>
                  <td className="py-3 text-zinc-500 text-xs">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-zinc-600">
            生产环境应由超级管理员在独立后台维护账号 CRUD；此处不开放注册入口。
          </p>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">登录日志（从审计中筛选）</CardTitle>
        </CardHeader>
        <CardContent className="max-h-48 overflow-y-auto space-y-2">
          {loginLogs.length === 0 ? (
            <p className="text-sm text-zinc-500">暂无登录记录。</p>
          ) : (
            loginLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400"
              >
                <span className="text-zinc-500">{log.at}</span>
                <span className="mx-2 text-zinc-600">|</span>
                <span className="text-amber-200/80">{log.operator}</span>
                <span className="mx-2 text-zinc-600">·</span>
                <span className="text-zinc-300">{log.action}</span>
                <div className="mt-1 text-zinc-500">{log.detail}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">操作审计（最近）</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400"
            >
              <span className="text-zinc-500">{log.at}</span>
              <span className="mx-2 text-zinc-600">|</span>
              <span className="text-amber-200/80">{log.operator}</span>
              <span className="mx-2 text-zinc-600">·</span>
              <span className="text-zinc-300">{log.action}</span>
              <div className="mt-1 text-zinc-500">{log.detail}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
