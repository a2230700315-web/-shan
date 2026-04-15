import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Image as ImageIcon, Link2, QrCode, Star, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Chart, registerables } from 'chart.js'
import { ProviderWebProvider, useProviderWeb } from '../store'
import type { Attachment } from '../domain/types'
import { loadPromotionCases, savePromotionCases, type PromotionCase } from '../promotion'

Chart.register(...registerables)

function ShowcaseInner() {
  const { orders, employees, assets, resetDemoData } = useProviderWeb()
  const [cases, setCases] = useState<PromotionCase[]>([])

  useEffect(() => {
    setCases(loadPromotionCases())
  }, [])

  const stats = useMemo(() => {
    const completed = orders.filter(o => o.lifecycleStatus === 'completed').length
    const revenue = orders
      .filter(o => o.lifecycleStatus === 'completed')
      .map(o => o.receipt?.receivedAmountYuan ?? o.workResult?.actualAmountYuan ?? 0)
      .reduce((a, b) => a + b, 0)
    const pilots = employees.filter(e => e.role === 'pilot').length
    const rating = 4.8
    return { completed, revenue, pilots, rating }
  }, [employees, orders])

  const candidatePhotos: { key: string; orderId: string; att: Attachment }[] = useMemo(() => {
    const list: { key: string; orderId: string; att: Attachment }[] = []
    for (const o of orders) {
      if (o.lifecycleStatus !== 'completed') continue
      const wr = o.workResult?.evidence ?? []
      for (const att of wr) {
        if (att.kind === 'photo') list.push({ key: `${o.id}:${att.id}`, orderId: o.id, att })
      }
    }
    return list
  }, [orders])

  const persist = (next: PromotionCase[]) => {
    const clipped = next.slice(0, 20)
    setCases(clipped)
    savePromotionCases(clipped)
  }

  const addCase = (item: { orderId: string; att: Attachment }) => {
    if (cases.length >= 20) return
    persist([
      ...cases,
      { id: `pc_${Math.random().toString(16).slice(2)}_${Date.now()}`, url: item.att.url, orderId: item.orderId, title: item.att.name },
    ])
  }

  const removeCase = (id: string) => persist(cases.filter(c => c.id !== id))

  const move = (id: string, dir: -1 | 1) => {
    const idx = cases.findIndex(c => c.id === id)
    if (idx < 0) return
    const j = idx + dir
    if (j < 0 || j >= cases.length) return
    const copy = cases.slice()
    const tmp = copy[idx]!
    copy[idx] = copy[j]!
    copy[j] = tmp
    persist(copy)
  }

  const publicUrl = useMemo(() => `${window.location.origin}${window.location.pathname}#/showcase`, [])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    const labels = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return `${d.getMonth() + 1}月`
    })
    const data = labels.map((_, i) => {
      // 演示：按完成订单的收款金额粗略聚合到“月份桶”（本地演示）
      const monthIndex = (new Date().getMonth() - (5 - i) + 12) % 12
      return orders
        .filter(o => o.lifecycleStatus === 'completed')
        .filter(o => new Date(o.receipt?.receivedAt ?? o.timeline[o.timeline.length - 1]?.at ?? Date.now()).getMonth() === monthIndex)
        .map(o => o.receipt?.receivedAmountYuan ?? o.workResult?.actualAmountYuan ?? 0)
        .reduce((a, b) => a + b, 0) / 10000
    })

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '月度产值（万元）',
          data,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [orders])

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-accent" />
              服务商推广页（手动案例管理）
            </h1>
            <p className="text-muted-foreground">从完工订单凭证挑选案例（最多 20 张），支持排序/删除；并生成分享信息</p>
          </div>
          <Button variant="outline" onClick={resetDemoData}>重置演示数据</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-6"><div className="text-2xl font-black">{stats.completed}</div><div className="text-xs text-muted-foreground">完成订单</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-2xl font-black">{(stats.revenue / 10000).toFixed(1)}</div><div className="text-xs text-muted-foreground">累计收款（万元，演示）</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-2xl font-black">{assets.length}</div><div className="text-xs text-muted-foreground">在册资产</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-2xl font-black flex items-center gap-2">{stats.rating.toFixed(1)} <Star className="w-5 h-5 text-neon-orange fill-neon-orange" /></div><div className="text-xs text-muted-foreground">综合评分（演示）</div></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">近 6 个月产值趋势（演示）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <canvas ref={canvasRef} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">预览与分享</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground break-all">{publicUrl}</div>
              <div className="flex gap-2">
                <Button variant="premium" className="flex-1" onClick={async () => {
                  await navigator.clipboard.writeText(publicUrl)
                }}>
                  <Link2 className="w-4 h-4 mr-2" />
                  复制链接
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicUrl)}`, '_blank')}>
                  <QrCode className="w-4 h-4 mr-2" />
                  二维码
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                说明：二维码由第三方在线服务生成（演示），生产环境建议后端生成二维码图片并缓存。
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-accent" />
                候选案例图（来自已完成订单作业照片）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidatePhotos.length === 0 && <div className="text-sm text-muted-foreground">暂无可用照片（请先在订单完成节点上传图片凭证）</div>}
              <div className="grid grid-cols-2 gap-3">
                {candidatePhotos.map(p => (
                  <div key={p.key} className="rounded-2xl border overflow-hidden">
                    <div className="aspect-video bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground">
                      {/* 本地 blob url 预览在浏览器里可直接显示 */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.att.url} alt={p.att.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground truncate">{p.orderId}</div>
                      <Button size="sm" variant="premium" disabled={cases.length >= 20} onClick={() => addCase({ orderId: p.orderId, att: p.att })}>
                        加入案例
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">已选案例（{cases.length}/20）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cases.length === 0 && <div className="text-sm text-muted-foreground">从左侧挑选图片加入案例</div>}
              <div className="grid grid-cols-2 gap-3">
                {cases.map(c => (
                  <div key={c.id} className="rounded-2xl border overflow-hidden">
                    <div className="aspect-video bg-secondary/30">
                      <img src={c.url} alt={c.title ?? 'case'} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground truncate">{c.orderId ?? c.title ?? c.id}</div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => move(c.id, -1)}><ArrowUp className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => move(c.id, 1)}><ArrowDown className="w-4 h-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => removeCase(c.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ShowcasePage() {
  return (
    <ProviderWebProvider>
      <ShowcaseInner />
    </ProviderWebProvider>
  )
}
