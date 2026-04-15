import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, getStatusLabel } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '@/lib/types'
import {
  ClipboardList, Search, MapPin, Navigation, Package, User,
  Plane, ChevronDown, ChevronUp, Clock, ArrowRight
} from 'lucide-react'

const statusTabs: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待分配' },
  { value: 'assigned', label: '已分配' },
  { value: 'working', label: '作业中' },
  { value: 'settling', label: '待结算' },
  { value: 'completed', label: '已完成' },
]

const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'assigned',
  assigned: 'working',
  working: 'settling',
  settling: 'completed',
}

const nextActionLabel: Partial<Record<OrderStatus, string>> = {
  pending: '分配人员',
  assigned: '开始作业',
  working: '完成作业',
  settling: '确认结算',
}

const pilots = ['张鹏飞', '陈天翔', '赵安全', '周勤务']
const workers = ['李地勤', '赵安全', '周勤务']
const droneModels = ['DJI FlyCart 30', 'EHang 216L', '御风未来 M1']

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const { updateOrder, showToast, currentRole } = useApp()
  const [assignPilot, setAssignPilot] = useState(order.assignedPilot || '')
  const [assignWorker, setAssignWorker] = useState(order.assignedWorker || '')
  const [assignDrone, setAssignDrone] = useState(order.assignedDrone || '')

  const canManage = currentRole === 'admin' || currentRole === 'service'
  const canUpdateStatus = canManage || currentRole === 'pilot'

  const handleAdvanceStatus = () => {
    const next = nextStatusMap[order.status]
    if (!next) return

    // 飞手可直接“抢单接单”，提高流程联动可测试性
    const isPilotTakeOrder = currentRole === 'pilot' && order.status === 'pending' && !order.assignedPilot
    const resolvedPilot = isPilotTakeOrder ? '当前飞手' : (assignPilot || order.assignedPilot)

    if (order.status === 'pending' && (!resolvedPilot || !assignDrone && !order.assignedDrone)) {
      showToast('请先分配飞手和无人机', 'error')
      return
    }

    const log = {
      time: new Date().toLocaleString('zh-CN'),
      action: order.status === 'pending'
        ? `分配飞手: ${resolvedPilot}, 设备: ${assignDrone || order.assignedDrone || '待补充'}`
        : `状态变更: ${getStatusLabel(order.status)} → ${getStatusLabel(next)}`,
      operator: currentRole === 'pilot' ? (resolvedPilot || '飞手') : '客服',
    }

    updateOrder(order.id, {
      status: next,
      assignedPilot: resolvedPilot,
      assignedWorker: assignWorker || order.assignedWorker,
      assignedDrone: assignDrone || order.assignedDrone,
      updatedAt: new Date().toLocaleString('zh-CN'),
      logs: [...order.logs, log],
    })

    if (order.status === 'pending') {
      showToast(`已接单并进入「${getStatusLabel(next)}」`)
    } else {
      showToast(`订单已更新为「${getStatusLabel(next)}」`)
    }
  }

  const selectCls = "w-full h-10 px-4 rounded-xl border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 animate-slide-up">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <span className="text-lg">{order.id}</span>
              <StatusBadge variant={order.status}>{getStatusLabel(order.status)}</StatusBadge>
            </CardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Client info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">客户:</span>
              <span className="font-medium">{order.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">电话:</span>
              <span className="font-medium">{order.clientPhone}</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">起吊:</span>
              <span className="font-medium">{order.pickupPoint.label}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">送达:</span>
              <span className="font-medium">{order.deliveryPoint.label}</span>
            </div>
            <div className="text-sm text-accent font-medium ml-6">直线距离 {order.distance.toFixed(1)} km</div>
          </div>

          {/* Cargo */}
          <div className="p-4 rounded-2xl bg-secondary/30 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Package className="w-4 h-4 text-accent" />
              物资: {order.cargo.name}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <span>总重: {order.cargo.totalWeight}kg</span>
              <span>单件最重: {order.cargo.maxSingleWeight}kg</span>
              <span>尺寸: {order.cargo.length}×{order.cargo.width}×{order.cargo.height}m</span>
            </div>
          </div>

          {/* Assignment */}
          {canManage && order.status === 'pending' && (
            <div className="space-y-3 p-4 rounded-2xl border border-accent/20 bg-accent/5">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Plane className="w-4 h-4 text-accent" />
                人员与设备分配
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">飞手</label>
                  <select className={selectCls} value={assignPilot} onChange={e => setAssignPilot(e.target.value)}>
                    <option value="">选择飞手</option>
                    {pilots.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">地勤</label>
                  <select className={selectCls} value={assignWorker} onChange={e => setAssignWorker(e.target.value)}>
                    <option value="">选择地勤</option>
                    {workers.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">无人机</label>
                  <select className={selectCls} value={assignDrone} onChange={e => setAssignDrone(e.target.value)}>
                    <option value="">选择设备</option>
                    {droneModels.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Current assignment display */}
          {order.assignedPilot && (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-secondary/30">
                <div className="text-xs text-muted-foreground mb-1">飞手</div>
                <div className="font-semibold">{order.assignedPilot}</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30">
                <div className="text-xs text-muted-foreground mb-1">地勤</div>
                <div className="font-semibold">{order.assignedWorker || '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30">
                <div className="text-xs text-muted-foreground mb-1">设备</div>
                <div className="font-semibold">{order.assignedDrone || '—'}</div>
              </div>
            </div>
          )}

          {/* Action */}
          {canUpdateStatus && nextStatusMap[order.status] && (
            <Button variant="premium" className="w-full" onClick={handleAdvanceStatus}>
              {nextActionLabel[order.status]}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Logs */}
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              操作日志
            </h4>
            <div className="space-y-2">
              {order.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">{log.time}</span>
                    <span className="mx-2 text-foreground font-medium">{log.action}</span>
                    <span className="text-muted-foreground">({log.operator})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount */}
          {order.amount > 0 && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
              <span className="text-sm text-muted-foreground">订单金额</span>
              <span className="text-xl font-black text-gradient">{formatCurrency(order.amount)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrdersPage() {
  const { orders, currentRole } = useApp()
  const [tab, setTab] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filter by role
  let visibleOrders = orders
  if (currentRole === 'pilot') {
    // 飞手可查看待分配订单与已分配到自己的订单，确保任务链路可见
    visibleOrders = orders.filter(o => o.status === 'pending' || !!o.assignedPilot || !!o.assignedWorker)
  }

  const filtered = visibleOrders.filter(o => {
    if (tab !== 'all' && o.status !== tab) return false
    if (search && !o.id.includes(search) && !o.clientName.includes(search)) return false
    return true
  })

  const counts = {
    all: visibleOrders.length,
    pending: visibleOrders.filter(o => o.status === 'pending').length,
    assigned: visibleOrders.filter(o => o.status === 'assigned').length,
    working: visibleOrders.filter(o => o.status === 'working').length,
    settling: visibleOrders.filter(o => o.status === 'settling').length,
    completed: visibleOrders.filter(o => o.status === 'completed').length,
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-accent" />
              订单管理
            </h1>
            <p className="text-muted-foreground">全生命周期订单追踪与管理</p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statusTabs.map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  tab === t.value
                    ? 'bg-primary/10 text-accent shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-xs opacity-60">{counts[t.value]}</span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full md:w-64 h-10 pl-10 pr-4 rounded-xl border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="搜索订单号或客户"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Order list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                暂无符合条件的订单
              </CardContent>
            </Card>
          )}

          {filtered.map(order => (
            <Card
              key={order.id}
              className="hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-sm">{order.id}</span>
                        <StatusBadge variant={order.status}>{getStatusLabel(order.status)}</StatusBadge>
                      </div>
                      <div className="text-sm text-muted-foreground">{order.clientName}</div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">物资</div>
                      <div className="font-medium">{order.cargo.name}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">距离</div>
                      <div className="font-medium">{order.distance.toFixed(1)}km</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">金额</div>
                      <div className="font-bold text-gradient">{order.amount > 0 ? formatCurrency(order.amount) : '待报价'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">飞手</div>
                      <div className="font-medium">{order.assignedPilot || '—'}</div>
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); setExpandedId(expandedId === order.id ? null : order.id) }}
                    className="text-muted-foreground hover:text-foreground md:hidden"
                  >
                    {expandedId === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mobile expanded view */}
                {expandedId === order.id && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm md:hidden">
                    <div><span className="text-muted-foreground">物资:</span> {order.cargo.name}</div>
                    <div><span className="text-muted-foreground">距离:</span> {order.distance.toFixed(1)}km</div>
                    <div><span className="text-muted-foreground">金额:</span> {order.amount > 0 ? formatCurrency(order.amount) : '待报价'}</div>
                    <div><span className="text-muted-foreground">飞手:</span> {order.assignedPilot || '—'}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
