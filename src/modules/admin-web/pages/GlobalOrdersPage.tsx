import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import type { AdminOrderStatus } from '../types'
import { cn } from '@/lib/utils'
import { filterGlobalOrders, type GlobalOrderQuery } from '../lib/adminOrderQuery'
import { ADMIN_ROUTES } from '../routes'

function statusLabel(s: AdminOrderStatus): string {
  switch (s) {
    case 'in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
    case 'closed':
      return '已关闭'
    case 'exception':
      return '异常'
    default:
      return s
  }
}

export default function GlobalOrdersPage() {
  const { globalOrders, providers } = useAdminConsole()
  const [status, setStatus] = useState<AdminOrderStatus | 'all'>('all')
  const [providerId, setProviderId] = useState<string | 'all'>('all')
  const [nodeContains, setNodeContains] = useState('')
  const [q, setQ] = useState('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')

  const query = useMemo<GlobalOrderQuery>(
    () => ({
      status,
      providerId,
      nodeContains,
      search: q,
      createdFrom,
      createdTo,
    }),
    [status, providerId, nodeContains, q, createdFrom, createdTo]
  )

  const rows = useMemo(() => filterGlobalOrders(globalOrders, query), [globalOrders, query])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">全局订单</h1>
        <p className="mt-1 text-sm text-zinc-400">

        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'in_progress', 'completed', 'closed', 'exception'] as const).map((k) => (
          <Button
            key={k}
            type="button"
            size="sm"
            variant={status === k ? 'default' : 'outline'}
            className={cn(status === k ? 'bg-amber-600 hover:bg-amber-500' : 'border-zinc-600 text-zinc-300')}
            onClick={() => setStatus(k)}
          >
            {k === 'all' ? '全部' : statusLabel(k)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="text-[11px] text-zinc-500">服务商</label>
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value === 'all' ? 'all' : e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="all">全部服务商</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.companyName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-zinc-500">当前节点（包含）</label>
          <input
            value={nodeContains}
            onChange={(e) => setNodeContains(e.target.value)}
            placeholder="如：报价、关闭、吊运"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-500">关键字（订单号/客户/服务商/手机）</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索…"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-500">创建时间起（含）</label>
          <input
            type="datetime-local"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-500">创建时间止（含）</label>
          <input
            type="datetime-local"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">订单列表 · {rows.length} 条</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 pr-4 font-medium">订单号</th>
                <th className="pb-3 pr-4 font-medium">服务商</th>
                <th className="pb-3 pr-4 font-medium">客户</th>
                <th className="pb-3 pr-4 font-medium">当前节点</th>
                <th className="pb-3 pr-4 font-medium">状态</th>
                <th className="pb-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-zinc-800/80">
                  <td className="py-3 pr-4 font-mono text-amber-200/90">
                    <Link to={ADMIN_ROUTES.orderDetail(o.id)} className="hover:underline">
                      {o.orderNo}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{o.providerName}</td>
                  <td className="py-3 pr-4">{o.clientName}</td>
                  <td className="py-3 pr-4 text-zinc-400">{o.currentNode}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        o.status === 'exception' && 'bg-red-500/20 text-red-300',
                        o.status === 'in_progress' && 'bg-blue-500/15 text-blue-200',
                        o.status === 'completed' && 'bg-emerald-500/15 text-emerald-300',
                        o.status === 'closed' && 'bg-zinc-700 text-zinc-300'
                      )}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={ADMIN_ROUTES.orderDetail(o.id)}>
                      <Button type="button" size="sm" variant="ghost" className="h-8 text-zinc-400">
                        详情
                      </Button>
                    </Link>
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
