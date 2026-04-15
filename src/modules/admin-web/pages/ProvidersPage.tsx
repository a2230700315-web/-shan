import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import type { ProviderAuditStatus } from '../types'
import { cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '../routes'

export default function ProvidersPage() {
  const { providers, approveProvider, rejectProvider, setProviderDisabled } = useAdminConsole()
  const [filter, setFilter] = useState<ProviderAuditStatus | 'all'>('all')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const rows = useMemo(() => {
    if (filter === 'all') return providers
    return providers.filter((p) => p.auditStatus === filter)
  }, [providers, filter])

  const confirmReject = () => {
    if (!rejectingId || !rejectReason.trim()) return
    rejectProvider(rejectingId, rejectReason.trim())
    setRejectingId(null)
    setRejectReason('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">服务商管理</h1>
          <p className="mt-1 text-sm text-zinc-400">

          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((k) => (
            <Button
              key={k}
              type="button"
              size="sm"
              variant={filter === k ? 'default' : 'outline'}
              className={cn(
                filter === k ? 'bg-amber-600 hover:bg-amber-500' : 'border-zinc-600 text-zinc-300'
              )}
              onClick={() => setFilter(k)}
            >
              {k === 'all' ? '全部' : k === 'pending' ? '待审核' : k === 'approved' ? '已通过' : '已驳回'}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">服务商列表</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 pr-4 font-medium">公司</th>
                <th className="pb-3 pr-4 font-medium">审核</th>
                <th className="pb-3 pr-4 font-medium">状态</th>
                <th className="pb-3 pr-4 font-medium">订单量</th>
                <th className="pb-3 pr-4 font-medium">评分</th>
                <th className="pb-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/80">
                  <td className="py-3 pr-4">
                    <Link to={ADMIN_ROUTES.providerDetail(p.id)} className="text-amber-400 hover:underline font-medium">
                      {p.companyName}
                    </Link>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{p.creditCode}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        p.auditStatus === 'pending' && 'bg-amber-500/20 text-amber-200',
                        p.auditStatus === 'approved' && 'bg-emerald-500/15 text-emerald-300',
                        p.auditStatus === 'rejected' && 'bg-red-500/15 text-red-300'
                      )}
                    >
                      {p.auditStatus === 'pending' ? '待审核' : p.auditStatus === 'approved' ? '已通过' : '已驳回'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{p.disabled ? <span className="text-red-400">已禁用</span> : '正常'}</td>
                  <td className="py-3 pr-4 tabular-nums">{p.ordersCount}</td>
                  <td className="py-3 pr-4 tabular-nums">{p.rating > 0 ? p.rating.toFixed(1) : '—'}</td>
                  <td className="py-3 text-right space-x-2 whitespace-nowrap">
                    {p.auditStatus === 'pending' && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500 h-8"
                          onClick={() => approveProvider(p.id)}
                        >
                          通过
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() => setRejectingId(p.id)}
                        >
                          驳回
                        </Button>
                      </>
                    )}
                    {p.auditStatus === 'approved' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-zinc-600 h-8"
                        onClick={() => setProviderDisabled(p.id, !p.disabled)}
                      >
                        {p.disabled ? '启用' : '禁用'}
                      </Button>
                    )}
                    <Link to={ADMIN_ROUTES.providerDetail(p.id)}>
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

      {rejectingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md border-zinc-700 bg-zinc-900 text-zinc-100">
            <CardHeader>
              <CardTitle className="text-base">驳回原因</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder="请填写驳回原因（将记录在案）"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" className="border-zinc-600" onClick={() => setRejectingId(null)}>
                  取消
                </Button>
                <Button type="button" variant="destructive" onClick={confirmReject} disabled={!rejectReason.trim()}>
                  确认驳回
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
