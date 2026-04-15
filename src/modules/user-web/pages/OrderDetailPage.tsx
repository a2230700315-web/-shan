import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Clock, ArrowLeft, BadgeCheck, XCircle, MessageSquareWarning, Star } from 'lucide-react'
import { useUserWeb } from '../state/UserWebStore'
import type { Complaint } from '../domain/types'
import { nodeMeta } from '../domain/orderMachine'

function fmt(ms: number | null) {
  if (!ms) return '—'
  return new Date(ms).toLocaleString('zh-CN')
}

const complaintReasons: { value: Complaint['reason']; label: string }[] = [
  { value: 'service_attitude', label: '服务态度差' },
  { value: 'cargo_damage', label: '货损' },
  { value: 'overcharge', label: '乱收费' },
  { value: 'other', label: '其他' },
]

function canReview(orderCurrentNode: string, invoiceTime: number | null) {
  return orderCurrentNode === 'user_review' && invoiceTime != null
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { getOrderById, confirmQuote, rejectQuote, submitReview, createComplaint, complaints } = useUserWeb()
  const decodedId = useMemo(() => (orderId ? decodeURIComponent(orderId) : ''), [orderId])
  const order = getOrderById(decodedId)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [expectedPrice, setExpectedPrice] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [reviewComment, setReviewComment] = useState('')

  const [complaintReason, setComplaintReason] = useState<Complaint['reason']>('service_attitude')
  const [complaintContent, setComplaintContent] = useState('')

  if (!order) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-6">
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              未找到订单。返回 <Link to="/client/orders" className="text-accent font-semibold">订单中心</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const lastQuote = order.quoteRounds.length > 0 ? order.quoteRounds[order.quoteRounds.length - 1] : undefined
  const acceptTime = order.nodes.find(n => n.key === 'provider_accept')?.time ?? null
  const invoiceTime = order.nodes.find(n => n.key === 'issue_invoice')?.time ?? null
  const reviewTime = order.nodes.find(n => n.key === 'user_review')?.time ?? null
  const orderComplaints = complaints.filter(c => c.orderId === order.id)

  const actionCls = 'w-full'
  const inputCls =
    'w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all'

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/client/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              返回
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-black truncate">{order.id}</h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              发布于 {fmt(order.createdAt)} · 当前节点 {nodeMeta[order.currentNode]?.label}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-base">订单信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-accent mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-muted-foreground">起始点</div>
                    <div className="font-semibold break-words">{order.demand.pickupAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-success mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-muted-foreground">送达点</div>
                    <div className="font-semibold break-words">{order.demand.deliveryAddress}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-1">水平距离</div>
                    <div className="font-bold">{order.demand.horizontalDistanceKm.toFixed(1)} km</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-1">垂直距离</div>
                    <div className="font-bold">{order.demand.verticalDistanceMeters} m</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/30">
                    <div className="text-xs text-muted-foreground mb-1">期望日期</div>
                    <div className="font-bold">{order.demand.expectedDate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-base">节点时间线</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.nodes.map((n, idx) => {
                    const done = n.time != null
                    const isCurrent = order.currentNode === n.key && order.lifecycleStatus === 'open'
                    return (
                      <div key={n.key} className="flex items-start gap-3">
                        <div className={`mt-1 w-3 h-3 rounded-full ${done ? 'bg-success' : isCurrent ? 'bg-accent' : 'bg-border'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {idx + 1}. {n.label}
                            </div>
                            <div className="text-xs text-muted-foreground">({n.operatorLabel})</div>
                            {isCurrent && <div className="text-xs font-semibold text-accent">当前</div>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            时间：{fmt(n.time)}
                            {n.remark ? <span className="ml-2">备注：{n.remark}</span> : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-base">报价与议价</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!acceptTime && (
                  <div className="text-sm text-muted-foreground">
                    等待服务商接单（超时将自动关闭）。
                  </div>
                )}
                {order.quoteRounds.length === 0 && acceptTime && (
                  <div className="text-sm text-muted-foreground">
                    服务商已接单，等待报价。
                  </div>
                )}

                {lastQuote && (
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40">
                    <div className="text-sm font-bold mb-2">第 {lastQuote.round} 轮报价</div>
                    <div className="text-2xl font-black text-gradient mb-1">{lastQuote.providerPriceCny} 元</div>
                    {lastQuote.providerNote && <div className="text-xs text-muted-foreground">说明：{lastQuote.providerNote}</div>}
                    {lastQuote.userDecision && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        你的操作：{lastQuote.userDecision === 'confirm' ? '已确认' : '已拒绝'}
                        {lastQuote.userDecision === 'reject' && lastQuote.userExpectedPriceCny != null && (
                          <span className="ml-2">期望价：{lastQuote.userExpectedPriceCny} 元</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {order.awaitingUserQuoteDecision && (
                  <div className="space-y-2">
                    <Button className={`${actionCls} bg-primary text-foreground`} variant="default" onClick={() => confirmQuote(order.id)}>
                      <BadgeCheck className="w-4 h-4 mr-2" />
                      确认报价
                    </Button>
                    <Button className={actionCls} variant="outline" onClick={() => setRejectOpen(true)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      拒绝报价并议价
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      最多 3 轮议价；报价确认超时将自动关闭。
                    </div>
                  </div>
                )}

                {order.quoteRounds.length > 0 && (
                  <div className="pt-3 border-t border-border/40">
                    <div className="text-xs text-muted-foreground mb-2">历史记录</div>
                    <div className="space-y-2 text-sm">
                      {order.quoteRounds.map(r => (
                        <div key={r.round} className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">第 {r.round} 轮：{r.providerPriceCny} 元</div>
                            <div className="text-xs text-muted-foreground">{fmt(r.createdAt)}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.userDecision ? (r.userDecision === 'confirm' ? '已确认' : '已拒绝') : '待你处理/待服务商'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-base">评价 / 投诉</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewTime ? (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <Star className="w-4 h-4 text-yellow-500" />
                      已评价
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">提交时间：{fmt(reviewTime)}</div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground">
                      {canReview(order.currentNode, invoiceTime)
                        ? '吊运已结束并开票完成，请评价本次服务。'
                        : '评价将在“开具发票”之后开放。'}
                    </div>
                    {canReview(order.currentNode, invoiceTime) && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">评分（1-5星）</label>
                          <select className={inputCls} value={rating} onChange={e => setRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}>
                            {[5, 4, 3, 2, 1].map(v => (
                              <option key={v} value={v}>{v} 星</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">评语（选填）</label>
                          <textarea className="w-full min-h-24 px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-y" value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="填写评语" />
                        </div>
                        <Button className={`${actionCls} bg-primary text-foreground`} variant="default" onClick={() => submitReview(order.id, { rating, comment: reviewComment.trim() ? reviewComment.trim() : null })}>
                          提交评价
                        </Button>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-3 border-t border-border/40 space-y-3">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4 text-destructive" />
                    投诉
                  </div>
                  <div className="text-xs text-muted-foreground">
                    订单完成后可发起投诉，平台将生成工单并跟踪处理状态。
                  </div>
                  {order.lifecycleStatus === 'completed' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">投诉原因</label>
                        <select className={inputCls} value={complaintReason} onChange={e => setComplaintReason(e.target.value as Complaint['reason'])}>
                          {complaintReasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">投诉内容</label>
                        <textarea className="w-full min-h-24 px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-y" value={complaintContent} onChange={e => setComplaintContent(e.target.value)} placeholder="填写投诉内容（可补充凭证说明）" />
                      </div>
                      <Button
                        className={actionCls}
                        variant="outline"
                        onClick={() => createComplaint({
                          orderId: order.id,
                          reason: complaintReason,
                          content: complaintContent.trim() || '未填写',
                          evidenceImageUrls: [],
                        })}
                      >
                        提交投诉
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">订单未完成，暂不可投诉。</div>
                  )}

                  {orderComplaints.length > 0 && (
                    <div className="pt-3 border-t border-border/40">
                      <div className="text-xs text-muted-foreground mb-2">我的投诉记录</div>
                      <div className="space-y-2 text-sm">
                        {orderComplaints.map(c => (
                          <div key={c.id} className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{c.id}</div>
                              <div className="text-xs text-muted-foreground">
                                {c.status === 'pending' ? '待处理' : c.status === 'processing' ? '处理中' : '已解决'}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{fmt(c.createdAt)}</div>
                            <div className="text-sm mt-2 break-words">{c.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setRejectOpen(false)} />
          <Card className="relative w-full max-w-md z-10 animate-slide-up">
            <CardHeader className="border-b">
              <CardTitle className="text-base">拒绝报价并提交期望价</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">期望价格（元）</label>
                <input className={inputCls} value={expectedPrice} onChange={e => setExpectedPrice(e.target.value)} placeholder="请输入期望价" inputMode="decimal" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">说明（选填）</label>
                <textarea className="w-full min-h-24 px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-y" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="原因/说明" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setRejectOpen(false)}>取消</Button>
                <Button
                  variant="default"
                  className="flex-1 bg-primary text-foreground"
                  onClick={() => {
                    rejectQuote(order.id, Number(expectedPrice), rejectReason.trim() || '期望更低价格')
                    setRejectOpen(false)
                    setExpectedPrice('')
                    setRejectReason('')
                  }}
                >
                  提交
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">最多 3 轮议价；若 24 小时无新报价，订单将自动关闭。</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

