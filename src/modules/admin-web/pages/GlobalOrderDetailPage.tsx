import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import { ADMIN_ROUTES } from '../routes'

export default function GlobalOrderDetailPage() {
  const { id } = useParams()
  const { globalOrders, markOrderException, clearOrderException } = useAdminConsole()
  const order = useMemo(() => globalOrders.find((o) => o.id === id), [globalOrders, id])
  const [note, setNote] = useState('')

  if (!order) {
    return (
      <div className="text-zinc-400">
        未找到订单。{' '}
        <Link to={ADMIN_ROUTES.orders} className="text-amber-400 hover:underline">
          返回列表
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to={ADMIN_ROUTES.orders} className="text-sm text-zinc-500 hover:text-amber-400">
        ← 返回订单列表
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 font-mono">{order.orderNo}</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {order.providerName} · {order.clientName} {order.clientPhone}
        </p>
        {order.exceptionNote && <p className="text-sm text-red-400 mt-2">异常备注：{order.exceptionNote}</p>}
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">节点时间线</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative border-s border-zinc-700 ms-3 space-y-6">
            {order.timeline.map((e, i) => (
              <li key={`${e.at}-${i}`} className="ms-6">
                <span className="absolute flex items-center justify-center w-2 h-2 bg-amber-500 rounded-full -start-[5px] ring-4 ring-zinc-900" />
                <div className="text-sm text-zinc-100 font-medium">{e.node}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {e.operator} · {e.at}
                  {e.note ? ` · ${e.note}` : ''}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">异常订单处理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
            placeholder="标记异常时的平台备注（必填）"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={!note.trim()}
              onClick={() => {
                markOrderException(order.id, note.trim())
                setNote('')
              }}
            >
              标记异常
            </Button>
            {order.status === 'exception' && (
              <Button type="button" variant="outline" className="border-zinc-600" onClick={() => clearOrderException(order.id)}>
                解除异常标记
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
