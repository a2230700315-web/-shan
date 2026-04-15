import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'

export default function UsersPage() {
  const { platformUsers, setUserBlacklisted } = useAdminConsole()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">用户管理</h1>
        <p className="mt-1 text-sm text-zinc-400">
          注册用户列表与黑名单管理（演示数据，与 C 端账号体系隔离展示）。
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">用户列表</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 pr-4 font-medium">昵称</th>
                <th className="pb-3 pr-4 font-medium">手机</th>
                <th className="pb-3 pr-4 font-medium">实名</th>
                <th className="pb-3 pr-4 font-medium">注册时间</th>
                <th className="pb-3 font-medium text-right">黑名单</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {platformUsers.map((u) => (
                <tr key={u.id} className="border-b border-zinc-800/80">
                  <td className="py-3 pr-4">{u.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{u.phone}</td>
                  <td className="py-3 pr-4">{u.verified ? '已认证' : '未认证'}</td>
                  <td className="py-3 pr-4 text-zinc-500 text-xs">{u.registeredAt}</td>
                  <td className="py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant={u.blacklisted ? 'outline' : 'destructive'}
                      className={u.blacklisted ? 'border-zinc-600 h-8' : 'h-8'}
                      onClick={() => setUserBlacklisted(u.id, !u.blacklisted)}
                    >
                      {u.blacklisted ? '移出黑名单' : '加入黑名单'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
