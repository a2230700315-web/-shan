import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { ClipboardList, Search, ChevronDown, ChevronUp, Clock, MapPin, Navigation, Package, ArrowRight, Bell } from 'lucide-react'
import { ProviderWebProvider, useProviderWeb } from '../store'
import type { ProviderOrder, ProviderRole, Attachment } from '../domain/types'
import { canViewOrder, canPerformNode, canCloseOrder, nodeLabel, ORDER_NODES } from '../domain/workflow'

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN')
}

function y(money: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(money)
}

function RoleSwitcher({ onComplaintClick }: { onComplaintClick: (complaintId: string) => void }) {
  const { session, setSession, employees, notifications, markNotificationRead } = useProviderWeb()
  const unread = useMemo(() => notifications.filter(n => !n.readAt && (!n.toRole || n.toRole === session.role)).length, [notifications, session.role])
  const [showNotifications, setShowNotifications] = useState(false)

  const roleOptions: { value: ProviderRole; label: string }[] = [
    { value: 'admin', label: '管理员' },
    { value: 'service', label: '客服' },
    { value: 'ground', label: '地勤' },
    { value: 'pilot', label: '飞手' },
    { value: 'finance', label: '财务' },
  ]

  const employeeChoices = employees.filter(e => e.role === session.role)

  const filteredNotifications = notifications.filter(n => !n.toRole || n.toRole === session.role)

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id)
    if (notification.complaintId) {
      onComplaintClick(notification.complaintId)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">角色</span>
        <select
          className="h-9 px-3 rounded-xl border bg-secondary/50 text-foreground text-sm"
          value={session.role}
          onChange={(e) => setSession({ role: e.target.value as ProviderRole, employeeId: undefined })}
        >
          {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">员工</span>
        <select
          className="h-9 px-3 rounded-xl border bg-secondary/50 text-foreground text-sm"
          value={session.employeeId ?? ''}
          onChange={(e) => setSession({ ...session, employeeId: e.target.value || undefined })}
        >
          <option value="">（不指定）</option>
          {employeeChoices.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2 text-sm">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center gap-2 text-sm hover:bg-secondary/50 p-1 rounded-full"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">未读</span>
            <span className="font-bold">{unread}</span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-background border rounded-xl shadow-lg z-50">
              <div className="p-3 border-b">
                <h3 className="font-semibold">通知中心</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    暂无通知
                  </div>
                ) : (
                  filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 border-b cursor-pointer hover:bg-secondary/30 ${!notification.readAt ? 'bg-accent/5' : ''}`}
                    >
                      <div className="font-medium text-sm mb-1">{notification.title}</div>
                      <div className="text-xs text-muted-foreground mb-1">{notification.content}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ComplaintDetail({ complaint, onClose }: { complaint: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 animate-slide-up">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <span className="text-lg font-mono">投诉工单 {complaint.id}</span>
              <StatusBadge variant={complaint.status === 'resolved' ? 'completed' : complaint.status === 'processing' ? 'assigned' : 'maintenance'}>
                {complaint.status === 'resolved' ? '已解决' : complaint.status === 'processing' ? '处理中' : '待处理'}
              </StatusBadge>
            </CardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">订单编号</div>
                <div className="font-medium">{complaint.orderNo}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">提交时间</div>
                <div className="font-medium">{new Date(complaint.createdAt).toLocaleString('zh-CN')}</div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1">投诉内容</div>
              <div className="p-3 rounded-xl bg-secondary/30">{complaint.content}</div>
            </div>
            
            {complaint.platformResult && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">处理结果</div>
                <div className="p-3 rounded-xl bg-accent/10">{complaint.platformResult}</div>
              </div>
            )}
            
            {complaint.rectificationSuggestion && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">整改建议</div>
                <div className="p-3 rounded-xl bg-warning/10">{complaint.rectificationSuggestion}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
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

function OrderDetail({ order, onClose }: { order: ProviderOrder; onClose: () => void }) {
  const { applyToOrder, applyUserQuoteDecisionToOrder, employees, assets, session } = useProviderWeb()
  const { showToast } = useApp()

  const [closeNote, setCloseNote] = useState('')
  const lastQuoteInit = order.quotes[order.quotes.length - 1]
  const [quotePrice, setQuotePrice] = useState(lastQuoteInit?.providerPriceYuan ?? 0)
  const [quoteNote, setQuoteNote] = useState('')
  const [expectedRejectPrice, setExpectedRejectPrice] = useState('')
  const [assignPilot, setAssignPilot] = useState(order.assignment?.pilotEmployeeId ?? '')
  const [assignGround, setAssignGround] = useState(order.assignment?.groundEmployeeId ?? '')
  const [assignDrone, setAssignDrone] = useState(order.assignment?.droneId ?? '')
  const [assignVehicle, setAssignVehicle] = useState(order.assignment?.vehicleId ?? '')
  const [departNote, setDepartNote] = useState('')
  const [departAtts, setDepartAtts] = useState<Attachment[]>([])
  const [startNote, setStartNote] = useState('')
  const [startAtts, setStartAtts] = useState<Attachment[]>([])
  const [finishAtts, setFinishAtts] = useState<Attachment[]>([])
  const [actualWeight, setActualWeight] = useState(order.workResult?.actualWeightKg ?? 0)
  const [actualLen, setActualLen] = useState(order.workResult?.actualVolumeCm.length ?? order.cargo.lengthCm)
  const [actualWid, setActualWid] = useState(order.workResult?.actualVolumeCm.width ?? order.cargo.widthCm)
  const [actualHei, setActualHei] = useState(order.workResult?.actualVolumeCm.height ?? order.cargo.heightCm)
  const [actualAmount, setActualAmount] = useState(order.workResult?.actualAmountYuan ?? (lastQuoteInit?.providerPriceYuan ?? 0))

  const [invoiceNo, setInvoiceNo] = useState(order.invoice?.invoiceNo ?? '')
  const [receiptAmount, setReceiptAmount] = useState(order.receipt?.receivedAmountYuan ?? (order.workResult?.actualAmountYuan ?? 0))
  const [receiptMethod, setReceiptMethod] = useState(order.receipt?.method ?? 'bank_transfer')

  const operatorName = useMemo(() => {
    const emp = employees.find(e => e.id === session.employeeId)
    return emp?.name ?? '未命名员工'
  }, [employees, session.employeeId])

  const run = (action: any) => {
    try {
      applyToOrder(order.id, { role: session.role, name: operatorName }, action)
      showToast('操作成功')
      onClose()
    } catch (e: any) {
      showToast(e?.message ?? '操作失败', 'error')
    }
  }

  const runUserDecision = (params: { decision: 'accepted' | 'rejected'; expectedPriceYuan?: number; note?: string }) => {
    try {
      applyUserQuoteDecisionToOrder(order.id, { at: Date.now(), ...params })
      showToast('已模拟用户操作')
      onClose()
    } catch (e: any) {
      showToast(e?.message ?? '操作失败', 'error')
    }
  }

  const canAct = canPerformNode(session.role, order.currentNode)
  const lastQuote = order.quotes[order.quotes.length - 1]

  const pilots = employees.filter(e => e.role === 'pilot')
  const grounds = employees.filter(e => e.role === 'ground')
  const drones = assets.filter(a => a.type === 'drone' && a.status === 'available')
  const vehicles = assets.filter(a => a.type === 'vehicle' && a.status === 'available')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto z-10 animate-slide-up">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <span className="text-lg font-mono">{order.id}</span>
              <StatusBadge variant={order.lifecycleStatus === 'closed' ? 'maintenance' : order.lifecycleStatus === 'completed' ? 'completed' : 'assigned'}>
                {order.lifecycleStatus === 'closed' ? '已关闭' : order.lifecycleStatus === 'completed' ? '已完成' : '进行中'}
              </StatusBadge>
              <span className="text-sm text-muted-foreground">当前节点：{nodeLabel(order.currentNode)}</span>
            </CardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
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
                <span>期望 {formatTime(order.expectedAt)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
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
                  <div key={n.key} className={`p-3 rounded-xl border ${done ? 'border-accent/30 bg-accent/5' : 'border-border/50 bg-secondary/10'}`}>
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

          {/* Node actions */}
          {order.lifecycleStatus === 'in_progress' && (
            <div className="space-y-4">
              <div className="text-sm font-bold">节点操作</div>

              {/* 接单 */}
              {order.currentNode === 'demand_submitted' && canAct && (
                <Button variant="default" className="w-full bg-primary text-foreground" onClick={() => run({ type: 'provider_accept', at: Date.now() })}>
                  接单 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {/* 关闭 */}
              {canCloseOrder(session.role, order) && (
                <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-2">
                  <div className="text-sm font-semibold">无法服务 / 关闭订单</div>
                  <textarea
                    className="w-full min-h-20 p-3 rounded-xl border bg-secondary/50 text-sm"
                    placeholder="必填：关闭理由"
                    value={closeNote}
                    onChange={(e) => setCloseNote(e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={!closeNote.trim()}
                    onClick={() => run({ type: 'provider_close', at: Date.now(), note: closeNote.trim(), reason: 'manual_close' })}
                  >
                    关闭订单
                  </Button>
                </div>
              )}

              {/* 报价 / 议价再报价 */}
              {(order.currentNode === 'provider_quote' || (order.currentNode === 'user_confirm_quote' && lastQuote?.userDecision === 'rejected')) && (session.role === 'admin' || session.role === 'service') && (
                <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">服务商报价</div>
                    <div className="text-xs text-muted-foreground">最多 3 轮，当前第 {order.quotes.length + 1} 轮</div>
                  </div>
                  {lastQuote?.userDecision === 'rejected' && (
                    <div className="text-xs text-muted-foreground">
                      用户拒绝：{lastQuote.userExpectedPriceYuan ? `期望 ${y(lastQuote.userExpectedPriceYuan)}` : '未填写期望价格'}{lastQuote.userNote ? `（${lastQuote.userNote}）` : ''}
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-xs text-muted-foreground mb-1 block">报价金额（元）</label>
                      <input
                        type="number"
                        className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(Number(e.target.value))}
                        min={1}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">报价说明（选填）</label>
                      <input
                        className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                        value={quoteNote}
                        onChange={(e) => setQuoteNote(e.target.value)}
                        placeholder="如：含人力与设备调度/夜间加急等"
                      />
                    </div>
                  </div>
                  <Button variant="default" className="w-full bg-primary text-foreground" onClick={() => run({ type: 'provider_quote_submit', at: Date.now(), priceYuan: quotePrice, note: quoteNote || undefined })}>
                    提交报价
                  </Button>
                </div>
              )}

              {/* 等待用户确认报价 */}
              {order.currentNode === 'user_confirm_quote' && (
                <div className="p-4 rounded-2xl border bg-secondary/20 text-sm">
                  <div className="font-semibold mb-1">等待用户确认报价</div>
                  <div className="text-muted-foreground">
                    {lastQuote ? `最新报价：${y(lastQuote.providerPriceYuan)}（第 ${lastQuote.round} 轮）` : '暂无报价'}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      服务商端演示：模拟用户侧操作（真实环境由用户端完成）
                    </div>
                    <div className="text-xs text-muted-foreground">
                      状态：{lastQuote?.userDecision === 'pending' ? '待用户确认' : lastQuote?.userDecision === 'rejected' ? '已拒绝（可继续议价）' : '已确认'}
                    </div>
                    <div className="grid md:grid-cols-3 gap-2">
                      <Button
                        variant="premium"
                        className="w-full"
                        disabled={!lastQuote || lastQuote.userDecision !== 'pending'}
                        onClick={() => runUserDecision({ decision: 'accepted' })}
                      >
                        模拟：确认报价
                      </Button>
                      <input
                        className="md:col-span-1 h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                        placeholder="期望价格（元）"
                        value={expectedRejectPrice}
                        onChange={(e) => setExpectedRejectPrice(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!lastQuote || lastQuote.userDecision !== 'pending'}
                        onClick={() => {
                          const v = expectedRejectPrice.trim() ? Number(expectedRejectPrice) : undefined
                          runUserDecision({ decision: 'rejected', expectedPriceYuan: v, note: '用户不满意报价' })
                        }}
                      >
                        模拟：拒绝报价
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 资源分配 */}
              {order.currentNode === 'resource_assign' && (session.role === 'admin' || session.role === 'service') && (
                <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 space-y-3">
                  <div className="text-sm font-semibold">资源分配</div>
                  <div className="text-xs text-muted-foreground">飞手和地勤为必选项，无人机和车辆为可选项</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">飞手 <span className="text-destructive">*</span></label>
                      <select className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={assignPilot} onChange={e => setAssignPilot(e.target.value)}>
                        <option value="">选择飞手</option>
                        {pilots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">地勤 <span className="text-destructive">*</span></label>
                      <select className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={assignGround} onChange={e => setAssignGround(e.target.value)}>
                        <option value="">选择地勤</option>
                        {grounds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">无人机（可选）</label>
                      <select className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={assignDrone} onChange={e => setAssignDrone(e.target.value)}>
                        <option value="">选择无人机</option>
                        {drones.map(d => <option key={d.id} value={d.id}>{d.name} ({d.serialOrPlate})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">车辆（可选）</label>
                      <select className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={assignVehicle} onChange={e => setAssignVehicle(e.target.value)}>
                        <option value="">选择车辆</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.serialOrPlate})</option>)}
                      </select>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    className="w-full bg-primary text-foreground"
                    disabled={!assignPilot || !assignGround}
                    onClick={() => run({ type: 'resource_assign', at: Date.now(), assignment: { pilotEmployeeId: assignPilot, groundEmployeeId: assignGround, droneId: assignDrone || undefined, vehicleId: assignVehicle || undefined } })}
                  >
                    确认分配
                  </Button>
                </div>
              )}

              {/* 地勤出发 */}
              {order.currentNode === 'ground_depart' && session.role === 'ground' && (
                <div className="p-4 rounded-2xl border border-warning/20 bg-warning/5 space-y-3">
                  <div className="text-sm font-semibold">前往吊运地点</div>
                  <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={departNote} onChange={e => setDepartNote(e.target.value)} placeholder="备注（选填）" />
                  <AttachmentPicker accept="image/*" onPicked={setDepartAtts} />
                  <Button variant="default" className="w-full bg-primary text-foreground" onClick={() => run({ type: 'ground_depart', at: Date.now(), note: departNote || undefined, attachments: departAtts.length ? departAtts : undefined })}>
                    已出发
                  </Button>
                </div>
              )}

              {/* 飞手开始 */}
              {order.currentNode === 'pilot_start' && session.role === 'pilot' && (
                <div className="p-4 rounded-2xl border border-warning/20 bg-warning/5 space-y-3">
                  <div className="text-sm font-semibold">开始吊运</div>
                  <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={startNote} onChange={e => setStartNote(e.target.value)} placeholder="备注（选填）" />
                  <AttachmentPicker accept="image/*" onPicked={setStartAtts} />
                  <Button variant="default" className="w-full bg-primary text-foreground" onClick={() => run({ type: 'pilot_start', at: Date.now(), note: startNote || undefined, attachments: startAtts.length ? startAtts : undefined })}>
                    开始作业
                  </Button>
                </div>
              )}

              {/* 飞手完工 */}
              {order.currentNode === 'pilot_finish' && session.role === 'pilot' && (
                <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 space-y-3">
                  <div className="text-sm font-semibold">吊运结束（填写实际数据并上传凭证）</div>
                  <div className="grid md:grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">重量(kg)</label>
                      <input type="number" className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={actualWeight} onChange={e => setActualWeight(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">长(cm)</label>
                      <input type="number" className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={actualLen} onChange={e => setActualLen(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">宽(cm)</label>
                      <input type="number" className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={actualWid} onChange={e => setActualWid(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">高(cm)</label>
                      <input type="number" className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={actualHei} onChange={e => setActualHei(Number(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">实际金额(元)</label>
                    <input type="number" className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={actualAmount} onChange={e => setActualAmount(Number(e.target.value))} />
                  </div>
                  <AttachmentPicker accept="image/*,video/*" onPicked={setFinishAtts} />
                  <Button
                    variant="default"
                    className="w-full bg-primary text-foreground"
                    onClick={() => run({
                      type: 'pilot_finish',
                      at: Date.now(),
                      result: {
                        actualWeightKg: actualWeight,
                        actualVolumeCm: { length: actualLen, width: actualWid, height: actualHei },
                        actualAmountYuan: actualAmount,
                        evidence: finishAtts.length ? finishAtts : undefined,
                      },
                    })}
                  >
                    提交完工
                  </Button>
                </div>
              )}

              {/* 财务开票收款 */}
              {order.currentNode === 'finance_invoice' && session.role === 'finance' && (
                <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 space-y-3">
                  <div className="text-sm font-semibold">开具发票 / 标记收款（可分步）</div>

                  {!order.invoice && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">发票号码</label>
                        <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="必填" />
                      </div>
                      <Button
                        variant="premium"
                        className="w-full"
                        disabled={!invoiceNo.trim()}
                        onClick={() => run({
                          type: 'finance_invoice',
                          at: Date.now(),
                          invoice: { invoiceNo: invoiceNo.trim(), invoicedAt: Date.now() },
                        })}
                      >
                        仅开票（先记录发票号）
                      </Button>
                    </div>
                  )}

                  {order.invoice && !order.receipt && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="text-xs text-muted-foreground">已开票：{order.invoice.invoiceNo}</div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">收款方式</label>
                          <select className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={receiptMethod} onChange={e => setReceiptMethod(e.target.value as any)}>
                            <option value="bank_transfer">对公转账</option>
                            <option value="cash">现金</option>
                            <option value="other">其他</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">收款金额（元）</label>
                          <input type="number" className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={receiptAmount} onChange={e => setReceiptAmount(Number(e.target.value))} />
                        </div>
                      </div>
                      <Button
                        variant="premium"
                        className="w-full"
                        disabled={receiptAmount <= 0}
                        onClick={() => run({
                          type: 'finance_invoice',
                          at: Date.now(),
                          invoice: { invoiceNo: order.invoice!.invoiceNo, invoicedAt: order.invoice!.invoicedAt },
                          receipt: { receivedAt: Date.now(), receivedAmountYuan: receiptAmount, method: receiptMethod as any, status: 'received' },
                        })}
                      >
                        标记收款并完成节点
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!canAct && order.lifecycleStatus === 'in_progress' && (
                <div className="text-xs text-muted-foreground">
                  当前角色无权限操作该节点，仅可查看。
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OrdersInner() {
  const { orders, session, complaints, updateComplaints } = useProviderWeb()
  const [tab, setTab] = useState<'in_progress' | 'completed' | 'closed' | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ProviderOrder | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)

  // 从localStorage同步投诉数据
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const adminStorageKey = 'shandiao.admin-console.v1'
        const adminRaw = localStorage.getItem(adminStorageKey)
        if (adminRaw) {
          const adminData = JSON.parse(adminRaw)
          if (adminData.complaints?.length) {
            updateComplaints(adminData.complaints)
          }
        }
      } catch (e) {
        console.error('同步投诉数据失败:', e)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [updateComplaints])

  const handleComplaintClick = (complaintId: string) => {
    const complaint = complaints.find(c => c.id === complaintId)
    if (complaint) {
      setSelectedComplaint(complaint)
    }
  }

  const visible = useMemo(() => {
    const list = orders.filter(o => canViewOrder(session.role, o, session.employeeId))
    return list.filter(o => {
      if (tab !== 'all' && o.lifecycleStatus !== tab) return false
      if (search && !o.id.includes(search) && !o.clientName.includes(search)) return false
      return true
    })
  }, [orders, search, session.employeeId, session.role, tab])

  const tabCounts = useMemo(() => ({
    all: orders.filter(o => canViewOrder(session.role, o, session.employeeId)).length,
    in_progress: orders.filter(o => o.lifecycleStatus === 'in_progress' && canViewOrder(session.role, o, session.employeeId)).length,
    completed: orders.filter(o => o.lifecycleStatus === 'completed' && canViewOrder(session.role, o, session.employeeId)).length,
    closed: orders.filter(o => o.lifecycleStatus === 'closed' && canViewOrder(session.role, o, session.employeeId)).length,
  }), [orders, session.employeeId, session.role])

  const tabs: { value: typeof tab; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'closed', label: '已关闭' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-accent" />
              服务商订单中心
            </h1>
            <p className="text-muted-foreground">按节点推进、角色权限控制、凭证上传与财务开票收款</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <RoleSwitcher onComplaintClick={handleComplaintClick} />
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  tab === t.value ? 'bg-primary/10 text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-xs opacity-60">{(tabCounts as any)[t.value]}</span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full md:w-72 h-10 pl-10 pr-4 rounded-xl border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="搜索订单号或客户"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {visible.length === 0 && (
            <Card>
              <CardContent className="py-14 text-center text-muted-foreground">
                暂无符合条件的订单
              </CardContent>
            </Card>
          )}

          {visible.map(order => {
            const lastQuoteRow = order.quotes[order.quotes.length - 1]
            return (
            <Card
              key={order.id}
              className="hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              onClick={() => setSelected(order)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm font-mono">{order.id}</span>
                      <StatusBadge variant={order.lifecycleStatus === 'closed' ? 'maintenance' : order.lifecycleStatus === 'completed' ? 'completed' : 'assigned'}>
                        {order.lifecycleStatus === 'closed' ? '已关闭' : order.lifecycleStatus === 'completed' ? '已完成' : nodeLabel(order.currentNode)}
                      </StatusBadge>
                    </div>
                    <div className="text-sm text-muted-foreground">{order.clientName}</div>
                  </div>

                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">物资</div>
                      <div className="font-medium">{order.cargo.name}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">期望日期</div>
                      <div className="font-medium">{new Date(order.expectedAt).toLocaleDateString('zh-CN')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">最新报价</div>
                      <div className="font-bold text-gradient">{lastQuoteRow?.providerPriceYuan ? y(lastQuoteRow.providerPriceYuan) : '待报价'}</div>
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); setExpandedId(expandedId === order.id ? null : order.id) }}
                    className="text-muted-foreground hover:text-foreground md:hidden"
                  >
                    {expandedId === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {expandedId === order.id && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm md:hidden">
                    <div><span className="text-muted-foreground">物资:</span> {order.cargo.name}</div>
                    <div><span className="text-muted-foreground">期望:</span> {new Date(order.expectedAt).toLocaleDateString('zh-CN')}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">当前节点:</span> {nodeLabel(order.currentNode)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
            )
          })}
        </div>
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
      {selectedComplaint && <ComplaintDetail complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ProviderWebProvider>
      <OrdersInner />
    </ProviderWebProvider>
  )
}
