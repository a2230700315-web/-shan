import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockDashboardStats, mockMonthlyRevenue, mockReviews, mockDrones, mockEmployees } from '@/lib/mockData'
import { formatNumber } from '@/lib/utils'
import { BarChart3, TrendingUp, Shield, Star, Award, Plane, Users, Clock, FileCheck, Sparkles } from 'lucide-react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

function StatCard({ icon: Icon, value, label, suffix, delay, gradient }: {
  icon: typeof BarChart3; value: string; label: string; suffix?: string; delay: number; gradient: string
}) {
  return (
    <Card 
      className="bg-secondary/30 backdrop-blur-sm border-border/30 hover:border-neon-blue/30 hover:shadow-neon transition-all duration-500 group animate-slide-up" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform duration-300 ${gradient}`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-3xl font-black text-gradient">
              {value}
              {suffix && <span className="text-sm font-bold text-muted-foreground ml-1">{suffix}</span>}
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)')
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.01)')

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: mockMonthlyRevenue.map(d => d.month.slice(5) + '月'),
        datasets: [{
          label: '月度产值',
          data: mockMonthlyRevenue.map(d => d.revenue / 10000),
          borderColor: '#00d4ff',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00d4ff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            callbacks: {
              label: (ctx) => `产值: ${(ctx.parsed.y ?? 0).toFixed(0)} 万元`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              callback: (val) => `${val}万`,
            },
          },
        },
      },
    })

    return () => { chartRef.current?.destroy() }
  }, [])

  return <canvas ref={canvasRef} />
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-neon-orange fill-neon-orange' : 'text-muted'}`}
        />
      ))}
    </div>
  )
}

export default function ShowcasePage() {
  const stats = mockDashboardStats
  const pilotCount = mockEmployees.filter(e => e.role === 'pilot').length

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="container mx-auto px-6 relative">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-4">
            <Sparkles className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-medium">实力展示</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-gradient" />
            服务商<span className="text-gradient">实力看板</span>
          </h1>
          <p className="text-muted-foreground text-lg">实时经营数据与资质展示</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BarChart3} value={formatNumber(stats.totalOrders)} label="累计订单" suffix="单" delay={0} gradient="from-neon-blue to-neon-cyan" />
          <StatCard icon={TrendingUp} value={(stats.totalRevenue / 10000).toFixed(0)} label="总产值" suffix="万元" delay={100} gradient="from-neon-cyan to-neon-green" />
          <StatCard icon={Clock} value={formatNumber(stats.safeFlightHours)} label="安全飞行" suffix="小时" delay={200} gradient="from-neon-purple to-neon-pink" />
          <StatCard icon={Star} value={stats.avgRating.toString()} label="综合评分" suffix="/5.0" delay={300} gradient="from-neon-pink to-neon-orange" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  近12个月产值趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <RevenueChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30 hover:border-neon-blue/30 hover:shadow-neon transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-neon">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gradient">{stats.droneCount}</div>
                    <div className="text-xs text-muted-foreground">在册无人机</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {mockDrones.slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/30">
                      <span className="text-muted-foreground">{d.model}</span>
                      <span className="font-semibold text-neon-cyan">{d.maxPayload}kg载荷</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30 hover:border-neon-purple/30 hover:shadow-neon-purple transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-neon-purple">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gradient">{pilotCount}</div>
                    <div className="text-xs text-muted-foreground">持证飞手</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground p-2 rounded-lg bg-secondary/30">
                  人均飞行 <span className="text-neon-purple font-bold">{Math.round(stats.safeFlightHours / pilotCount)}</span> 小时
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-white" />
            </div>
            合规资质
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: '民航局运营合格证', desc: 'CAAC-UAS-2025-0001', detail: '无人机经营许可', gradient: 'from-neon-blue to-neon-cyan' },
              { icon: Award, title: '持证飞手 ' + pilotCount + ' 人', desc: 'AOPA无人机驾驶员执照', detail: '全员持证上岗', gradient: 'from-neon-purple to-neon-pink' },
              { icon: Shield, title: '第三方责任险', desc: '保额 5000 万元', detail: '中国人保PICC承保', gradient: 'from-neon-green to-neon-cyan' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Card 
                  key={item.title} 
                  className="bg-secondary/30 backdrop-blur-sm border-border/30 hover:border-neon-blue/30 hover:shadow-neon transition-all duration-500 group"
                >
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-neon shrink-0 group-hover:scale-110 transition-transform duration-300 ${item.gradient}`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-neon-cyan font-medium">{item.desc}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-orange to-neon-pink flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            客户评价
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockReviews.map((review, i) => (
              <Card 
                key={review.id} 
                className="bg-secondary/30 backdrop-blur-sm border-border/30 hover:border-neon-orange/30 hover:shadow-neon transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm">{review.clientName}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{review.date}</span>
                    <span className="font-mono text-neon-blue">{review.orderId}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
