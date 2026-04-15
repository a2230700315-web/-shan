import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, ChevronRight, MapPin, Navigation, Clock } from 'lucide-react'
import { useUserWeb } from '../state/UserWebStore'
import { nodeMeta } from '../domain/orderMachine'

function fmtTime(ms: number) {
  const d = new Date(ms)
  return d.toLocaleString('zh-CN')
}

function lifecycleLabel(status: 'open' | 'closed' | 'completed') {
  if (status === 'open') return '进行中'
  if (status === 'completed') return '已完成'
  return '已关闭'
}

export default function OrdersPage() {
  const { orders } = useUserWeb()

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-accent" />
              订单中心
            </h1>
            <p className="text-muted-foreground">查看你发布的所有订单，按时间线跟踪节点进展。</p>
          </div>
          <Link to="/client/publish">
            <Button variant="premium">发布新需求</Button>
          </Link>
        </div>

        <div className="space-y-3">
          {orders.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                你还没有发布过需求。现在去 <Link className="text-accent font-semibold" to="/client/publish">发布需求</Link>
              </CardContent>
            </Card>
          )}

          {orders.map(order => {
            const current = nodeMeta[order.currentNode]?.label ?? '—'
            const created = fmtTime(order.createdAt)
            const tag = lifecycleLabel(order.lifecycleStatus)
            return (
              <Link key={order.id} to={`/client/orders/${encodeURIComponent(order.id)}`} className="block">
                <Card className="hover:shadow-card-hover transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-black text-sm">{order.id}</span>
                          <span className={`text-xs px-2 py-1 rounded-lg border ${tag === '进行中' ? 'bg-accent/10 text-accent border-accent/20' : tag === '已完成' ? 'bg-success/10 text-success border-success/20' : 'bg-secondary text-muted-foreground border-border/50'}`}>
                            {tag}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          发布于 {created}
                        </div>
                        <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-accent shrink-0" />
                            <span className="truncate">{order.demand.pickupAddress}</span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <Navigation className="w-4 h-4 text-success shrink-0" />
                            <span className="truncate">{order.demand.deliveryAddress}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">当前节点：</span>
                          <span className="font-semibold">{current}</span>
                          {order.awaitingUserQuoteDecision && (
                            <span className="ml-2 text-xs font-semibold text-destructive">待你确认报价</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

