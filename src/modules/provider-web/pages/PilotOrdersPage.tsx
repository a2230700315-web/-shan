import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { ClipboardList, Clock, MapPin, Navigation, Package, ArrowRight, Bell } from 'lucide-react'
import { usePilotWeb } from '../pilotStore'
import type { ProviderOrder, Attachment } from '../domain/types'
import { nodeLabel, ORDER_NODES } from '../domain/workflow'

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN')
}

function AttachmentPicker({ onPicked, accept }: { onPicked: (atts: Attachment[]) => void; accept?: string }) {
  const pick = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const atts: Attachment[] = Array.from(files).map(f => ({
      id: `att_${Math.random().toString(16).slice(2)}_${Date.now()}`,
      kind: f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'photo' : 'file',
      name: f.name,
      url: URL.createObjectURL(f),
    }))
    onPicked(atts)
  }
  return (
    <input
      type="file"
      className="block w-full text-sm text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-secondary file:text-foreground"
      multiple
      accept={accept}
      onChange={(e) => pick(e.target.files)}
    />
  )
}

function PilotOrderDetail({ order, onClose }: { order: ProviderOrder; onClose: () => void }) {
  const { applyToOrder, session } = usePilotWeb()

  const [startNote, setStartNote] = useState('')
  const [startAtts, setStartAtts] = useState<Attachment[]>([])
  const [finishAtts, setFinishAtts] = useState<Attachment[]>([])

  const run = (action: any) => {
    applyToOrder(order.id, action)
    onClose()
  }

  const isAssignedToMe = order.assignment?.pilotEmployeeId === session.pilotId || !order.assignment?.pilotEmployeeId
  const canStart = order.currentNode === 'pilot_start' && isAssignedToMe
  const canFinish = order.currentNode === 'pilot_finish' && isAssignedToMe

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 animate-slide-up">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <span className="text-lg font-mono">{order.id}</span>
              <StatusBadge variant={order.lifecycleStatus === 'closed' ? 'maintenance' : order.lifecycleStatus === 'completed' ? 'completed' : 'assigned'}>
                {order.lifecycleStatus === 'closed' ? '已关闭' : order.lifecycleStatus === 'completed' ? '已完成' : '进行中'}
              </StatusBadge>
            </CardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-sm text-muted-foreground">
            当前节点：<span className="font-semibold text-foreground">{nodeLabel(order.currentNode)}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">起吊</span>
                <span className="font-medium">{order.pickupPoint.label}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-success" />
                <span className="text-muted-foreground">送达</span>
                <span className="font-medium">{order.deliveryPoint.label}</span>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                水平 {Math.round(order.horizontalDistanceM)}m · 垂直 {Math.round(order.verticalDistanceM)}m
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Package className="w-4 h-4 text-accent" />
                物资：{order.cargo.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>总重 {order.cargo.totalWeightKg}kg</span>
                <span>单件最大 {order.cargo.maxSingleWeightKg}kg</span>
                <span>尺寸 {order.cargo.lengthCm}×{order.cargo.widthCm}×{order.cargo.heightCm}cm</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              节点时间线
            </div>
            <div className="space-y-2">
              {ORDER_NODES.map(n => {
                const done = order.timeline.some(t => t.node === n.key)
                const last = [...order.timeline].reverse().find(t => t.node === n.key)
                return (
                  <div key={n.key} className={`p-3 rounded-xl border ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/50 bg-secondary/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{n.label}</div>
                      <div className="text-xs text-muted-foreground">{last ? formatTime(last.at) : '—'}</div>
                    </div>
                    {last?.note && <div className="text-xs text-muted-foreground mt-1">{last.note}</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {order.lifecycleStatus === 'in_progress' && (canStart || canFinish) && (
            <div className="space-y-4">
              <div className="text-sm font-bold">作业操作</div>

              {canStart && (
                <div className="space-y-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="text-sm font-semibold text-emerald-600">开始作业</div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">备注（选填）</label>
                    <input
                      className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                      value={startNote}
                      onChange={e => setStartNote(e.target.value)}
                      placeholder="作业开始备注"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">附件（照片/视频）</label>
                    <AttachmentPicker onPicked={setStartAtts} accept="image/*,video/*" />
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => run({ type: 'pilot_start', at: Date.now(), note: startNote, attachments: startAtts })}
                  >
                    开始作业 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {canFinish && (
                <div className="space-y-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                  <div className="text-sm font-semibold text-blue-600">提交完工</div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">完工凭证（照片/视频）</label>
                    <AttachmentPicker onPicked={setFinishAtts} accept="image/*,video/*" />
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    onClick={() => run({ type: 'pilot_finish', at: Date.now(), attachments: finishAtts })}
                  >
                    提交完工 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {!isAssignedToMe && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-sm text-amber-600">
              此订单已分配给其他飞手
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PilotOrdersPage() {
  const { orders, notifications, session } = usePilotWeb()
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  const myOrders = useMemo(() => {
    let filtered = orders.filter(o => {
      const assignedToMe = !o.assignment?.pilotEmployeeId || o.assignment.pilotEmployeeId === session.pilotId
      return assignedToMe
    })
    if (filter === 'pending') {
      filtered = filtered.filter(o => o.currentNode === 'resource_assign' || o.currentNode === 'pilot_start')
    } else if (filter === 'in_progress') {
      filtered = filtered.filter(o => o.lifecycleStatus === 'in_progress' && o.currentNode !== 'resource_assign')
    } else if (filter === 'completed') {
      filtered = filtered.filter(o => o.lifecycleStatus === 'completed' || o.lifecycleStatus === 'closed')
    }
    return filtered
  }, [orders, session.pilotId, filter])

  const unread = useMemo(() => notifications.filter(n => !n.readAt).length, [notifications])

  const activeOrder = activeOrderId ? orders.find(o => o.id === activeOrderId) : null

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-emerald-500" />
              我的任务
            </h1>
            <p className="text-muted-foreground">查看分配给你的吊运任务，执行作业并提交凭证。</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">未读消息</span>
            <span className="font-bold text-emerald-500">{unread}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map(k => (
            <Button
              key={k}
              size="sm"
              variant={filter === k ? 'default' : 'outline'}
              className={filter === k ? 'bg-emerald-600 hover:bg-emerald-500' : 'border-zinc-600 text-zinc-300'}
              onClick={() => setFilter(k)}
            >
              {k === 'all' ? '全部' : k === 'pending' ? '待执行' : k === 'in_progress' ? '进行中' : '已完成'}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {myOrders.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                暂无分配给你的任务
              </CardContent>
            </Card>
          )}

          {myOrders.map(order => (
            <Card
              key={order.id}
              className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-emerald-500"
              onClick={() => setActiveOrderId(order.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-sm">{order.id}</span>
                      <StatusBadge variant={order.lifecycleStatus === 'closed' ? 'maintenance' : order.lifecycleStatus === 'completed' ? 'completed' : 'assigned'}>
                        {order.lifecycleStatus === 'closed' ? '已关闭' : order.lifecycleStatus === 'completed' ? '已完成' : '进行中'}
                      </StatusBadge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      当前节点：{nodeLabel(order.currentNode)}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">物资：</span>
                      <span className="font-medium">{order.cargo.name}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {activeOrder && (
        <PilotOrderDetail order={activeOrder} onClose={() => setActiveOrderId(null)} />
      )}
    </div>
  )
}
