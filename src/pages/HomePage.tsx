import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockDashboardStats } from '@/lib/mockData'
import {
  Zap, MapPin, Shield, Clock, ArrowRight, Package,
  Plane, BarChart3, Star, ChevronRight, Cpu, Radio,
  Sparkles, TrendingUp, Award, Rocket, Play, Pause
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { AnimatedCounter, MagneticButton, TiltCard } from '@/components/ui/interactive'

function HeroSection() {
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-yellow-400/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-blue-400/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="absolute right-[3%] top-1/2 -translate-y-1/2 hidden 2xl:block">
        <div className={`relative ${isPlaying ? 'animate-float' : ''}`}>
          <div className="absolute inset-0 bg-blue-yellow-gradient opacity-20 blur-3xl rounded-full scale-150" />
          <svg width="500" height="400" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative cursor-pointer hover:scale-105 transition-transform duration-500" onClick={() => setIsPlaying(!isPlaying)}>
            <defs>
              <linearGradient id="droneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#FACC15" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <ellipse cx="250" cy="180" rx="70" ry="25" fill="url(#droneGrad)" opacity="0.9" filter="url(#glow)"/>
            <rect x="200" y="160" width="100" height="40" rx="10" fill="#3B82F6" filter="url(#glow)"/>
            
            <line x1="200" y1="180" x2="100" y2="130" stroke="url(#droneGrad)" strokeWidth="5" filter="url(#glow)"/>
            <line x1="300" y1="180" x2="400" y2="130" stroke="url(#droneGrad)" strokeWidth="5" filter="url(#glow)"/>
            <line x1="200" y1="180" x2="100" y2="230" stroke="url(#droneGrad)" strokeWidth="5" filter="url(#glow)"/>
            <line x1="300" y1="180" x2="400" y2="230" stroke="url(#droneGrad)" strokeWidth="5" filter="url(#glow)"/>
            
            {isPlaying && (
              <>
                <ellipse cx="100" cy="130" rx="50" ry="10" fill="#FACC15" opacity="0.4">
                  <animateTransform attributeName="transform" type="rotate" from="0 100 130" to="360 100 130" dur="0.4s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="400" cy="130" rx="50" ry="10" fill="#FACC15" opacity="0.4">
                  <animateTransform attributeName="transform" type="rotate" from="0 400 130" to="360 400 130" dur="0.4s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="100" cy="230" rx="50" ry="10" fill="#FACC15" opacity="0.4">
                  <animateTransform attributeName="transform" type="rotate" from="0 100 230" to="360 100 230" dur="0.4s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="400" cy="230" rx="50" ry="10" fill="#FACC15" opacity="0.4">
                  <animateTransform attributeName="transform" type="rotate" from="0 400 230" to="360 400 230" dur="0.4s" repeatCount="indefinite"/>
                </ellipse>
                
                <circle cx="100" cy="130" r="6" fill="#3B82F6">
                  <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
                </circle>
                <circle cx="400" cy="130" r="6" fill="#2563EB">
                  <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" begin="0.4s"/>
                </circle>
                <circle cx="100" cy="230" r="6" fill="#FACC15">
                  <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" begin="0.2s"/>
                </circle>
                <circle cx="400" cy="230" r="6" fill="#EAB308">
                  <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" begin="0.6s"/>
                </circle>
              </>
            )}
            
            <line x1="250" y1="200" x2="250" y2="300" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8 4" opacity="0.5"/>
            
            <rect x="210" y="300" width="80" height="60" rx="8" fill="url(#droneGrad)" opacity="0.8" filter="url(#glow)"/>
            <rect x="218" y="308" width="64" height="44" rx="4" stroke="#FACC15" strokeWidth="2" fill="none" opacity="0.6"/>
            <text x="250" y="335" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">CARGO</text>
          </svg>
          <button 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-xs flex items-center gap-1.5 hover:bg-white transition-colors shadow-sm"
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying) }}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? '暂停' : '播放'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-fade-in hover:shadow-md transition-shadow cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm animate-pulse" />
              <Radio className="w-3.5 h-3.5 text-blue-500 relative" />
            </div>
            <span className="text-sm font-medium text-gray-800">低空经济 · 智能撮合平台</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-8 animate-slide-up">
            <span className="text-gray-900 hover:text-blue-600 transition-colors duration-300 cursor-default">重物上天</span>
            <br />
            <span className="blue-yellow-gradient-text inline-block hover:scale-105 transition-transform cursor-default">一键闪吊</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-12 animate-slide-up animate-delay-100 leading-relaxed">
            专注低空经济的无人机吊运撮合平台，连接电力、建筑、应急、光伏等场景的搬运需求与专业无人机服务商
          </p>

          <div className="flex flex-wrap gap-4 animate-slide-up animate-delay-200">
            <MagneticButton strength={0.2}>
              <Button 
                size="xl" 
                onClick={() => navigate('/client/publish')}
                className="bg-gradient-primary hover:opacity-90 text-white shadow-blue group"
              >
                <MapPin className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                立即发布需求
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Button 
                variant="outline" 
                size="xl" 
                onClick={() => navigate('/provider/showcase')}
                className="border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 group shadow-sm"
              >
                <BarChart3 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                查看服务实力
              </Button>
            </MagneticButton>
          </div>

          <div className="flex flex-wrap gap-8 mt-16 animate-slide-up animate-delay-300">
            {[
              { value: mockDashboardStats.totalOrders, label: '累计订单', icon: Package, color: 'blue' },
              { value: mockDashboardStats.safeFlightHours, label: '安全飞行', icon: Plane, color: 'yellow', suffix: 'h' },
              { value: mockDashboardStats.avgRating, label: '综合评分', icon: Star, color: 'blue', decimals: 1 },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div 
                  key={stat.label} 
                  className="flex items-center gap-3 group cursor-pointer hover:scale-105 transition-transform"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'} flex items-center justify-center group-hover:shadow-md transition-all duration-300`}>
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">
                      <AnimatedCounter 
                        end={stat.decimals ? Math.round(stat.value * 10) : stat.value} 
                        suffix={stat.suffix || ''} 
                      />
                      {stat.decimals && `.${(stat.value * 10) % 10}`}
                    </div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle cursor-pointer group" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-1 group-hover:border-blue-400 transition-colors">
          <div className="w-1.5 h-3 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: MapPin,
    title: '智能地图选点',
    desc: '双坐标拾取，基于海森公式自动测算距离，精准匹配最优吊运方案',
    color: 'blue',
  },
  {
    icon: Cpu,
    title: '服务商智能撮合',
    desc: '根据起吊点自动检索本地服务商，无匹配时总部统一调度，确保全覆盖',
    color: 'yellow',
  },
  {
    icon: Package,
    title: '物资精细化管理',
    desc: '录入重量、尺寸、单件限重，系统自动匹配适配机型与吊具方案',
    color: 'blue',
  },
  {
    icon: Shield,
    title: '全程安全保障',
    desc: '民航局运营合格证、飞手持证上岗、第三方责任险全额覆盖',
    color: 'yellow',
  },
  {
    icon: Clock,
    title: '极速应急响应',
    desc: '7×24小时在线接单，紧急需求2小时内完成调度起飞',
    color: 'blue',
  },
  {
    icon: Plane,
    title: '专业飞手团队',
    desc: '26名持证飞手，人均飞行时长超500小时，累计零事故记录',
    color: 'yellow',
  },
]

const scenarios = [
  { title: '电力巡检', desc: '输电塔钢构件、绝缘子等设备吊装上山', icon: Zap, color: 'blue' },
  { title: '建筑施工', desc: '高层建材、钢筋、混凝土预制件空中运输', icon: Package, color: 'yellow' },
  { title: '应急救灾', desc: '物资快速投送至交通中断的灾区', icon: Shield, color: 'blue' },
  { title: '光伏安装', desc: '光伏面板组件运送至山顶安装场地', icon: Radio, color: 'yellow' },
]

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
    >
      {children}
    </div>
  )
}

function FeaturesSection() {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50 to-transparent" />
      <div className="container mx-auto px-6 relative">
        <ScrollReveal>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6 hover:shadow-md transition-shadow cursor-default">
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-800">核心优势</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-gray-900">
              为什么选择<span className="blue-gradient-text">闪吊</span>
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto text-lg">
              从需求发布到作业完成，全流程智能化管理
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <ScrollReveal key={f.title}>
                <TiltCard>
                  <Card
                    className="group bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-500 cursor-default overflow-hidden"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <CardContent className="p-8 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                      <div className={`w-14 h-14 rounded-2xl ${f.color === 'blue' ? 'bg-gradient-primary shadow-blue' : 'bg-gradient-accent shadow-yellow'} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                </TiltCard>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ScenariosSection() {
  const navigate = useNavigate()
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6 hover:shadow-md transition-shadow cursor-default">
              <Rocket className="w-4 h-4 text-blue-500 animate-bounce-subtle" />
              <span className="text-sm font-medium text-gray-800">应用场景</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-gray-900">
              覆盖<span className="yellow-gradient-text">多元行业</span>
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto text-lg">
              电力、建筑、应急、光伏等多元行业解决方案
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((s, i) => {
            const Icon = s.icon
            return (
              <ScrollReveal key={s.title}>
                <button
                  onClick={() => navigate('/client/publish')}
                  className="group text-left w-full"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Card className="h-full bg-white border border-gray-100 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg overflow-hidden">
                    <CardContent className="p-8 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className={`w-16 h-16 rounded-2xl ${s.color === 'blue' ? 'bg-gradient-primary shadow-blue' : 'bg-gradient-accent shadow-yellow'} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                        <Icon className="w-8 h-8 text-white group-hover:animate-wiggle" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">{s.desc}</p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all duration-300">
                        立即咨询 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </button>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { value: mockDashboardStats.totalOrders, label: '累计订单量', suffix: '单', icon: Package, color: 'blue' },
    { value: Math.round(mockDashboardStats.totalRevenue / 10000), label: '总产值', suffix: '万元', icon: TrendingUp, color: 'yellow' },
    { value: mockDashboardStats.safeFlightHours, label: '安全飞行时长', suffix: '小时', icon: Plane, color: 'blue' },
    { value: mockDashboardStats.avgRating * 10, label: '综合评分', suffix: '/5.0', icon: Award, color: 'yellow', decimals: true },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <ScrollReveal key={s.label}>
                <div 
                  className="text-center group cursor-pointer hover:scale-105 transition-transform"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${s.color === 'blue' ? 'bg-gradient-primary shadow-blue' : 'bg-gradient-accent shadow-yellow'} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                    <AnimatedCounter end={s.decimals ? Math.round(s.value) : s.value} />
                    {!s.decimals && <span className="text-lg font-bold text-gray-500 ml-1">{s.suffix}</span>}
                    {s.decimals && <span className="text-lg font-bold text-gray-500 ml-1">.{s.value % 10}{s.suffix}</span>}
                  </div>
                  <div className="text-sm text-gray-600">{s.label}</div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <Card className="relative overflow-hidden bg-white border border-gray-100 group hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700" />
            <CardContent className="relative p-12 md:p-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 group-hover:shadow-md transition-shadow">
                <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-800">即刻启程</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-gray-900">
                准备好让重物<span className="blue-gradient-text">飞起来</span>了吗？
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto mb-10 text-lg">
                无需注册，3分钟完成需求发布，我们的客服团队将第一时间与您对接
              </p>
              <MagneticButton strength={0.15}>
                <Button 
                  size="xl" 
                  onClick={() => navigate('/publish')}
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-blue group/btn"
                >
                  <Zap className="w-5 h-5 mr-2 group-hover/btn:rotate-12 transition-transform" />
                  免费发布需求
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </MagneticButton>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-16 relative bg-gray-50">
      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 group cursor-pointer hover:scale-105 transition-transform">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-yellow-gradient rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse-blue">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black blue-gradient-text">闪吊</span>
              <span className="text-xs text-gray-500">无人机吊运撮合平台</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-default">
              <Shield className="w-4 h-4 text-blue-500 animate-pulse" />
              民航局运营许可: CAAC-UAS-2025-0001
            </span>
            <span className="hidden md:inline">·</span>
            <span className="flex items-center gap-2 hover:text-yellow-600 transition-colors cursor-default">
              <Shield className="w-4 h-4 text-yellow-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              第三方责任险: 5000万元
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all cursor-default">
            <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-800">综合评分 {mockDashboardStats.avgRating}</span>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-default">
            © 2026 闪吊科技 版权所有 | 低空经济 · 智能撮合
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <ScenariosSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
