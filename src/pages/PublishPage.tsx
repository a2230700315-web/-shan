import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/lib/store'
import { haversineDistance } from '@/lib/utils'
import { useUserWeb } from '@/modules/user-web/state/UserWebStore'
import { serviceProviders } from '@/lib/mockData'
import type { Coordinate } from '@/lib/types'
import { MapPin, Navigation, Package, Clock, Send, Info, CheckCircle, Sparkles, Zap } from 'lucide-react'
import L from 'leaflet'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg, hsl(210 100% 60%), hsl(280 100% 65%));display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px hsl(210 100% 60% / 0.6);border:3px solid white;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const deliveryIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg, hsl(150 100% 50%), hsl(190 100% 50%));display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px hsl(150 100% 50% / 0.6);border:3px solid white;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

L.Marker.prototype.options.icon = defaultIcon

export default function PublishPage() {
  const { showToast } = useApp()
  const { createDemand } = useUserWeb()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const deliveryMarkerRef = useRef<L.Marker | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)

  const [selectMode, setSelectMode] = useState<'pickup' | 'delivery' | null>(null)
  const [pickup, setPickup] = useState<Coordinate | null>(null)
  const [delivery, setDelivery] = useState<Coordinate | null>(null)
  const [distance, setDistance] = useState<number>(0)
  const [hasLocalProvider, setHasLocalProvider] = useState<boolean | null>(null)

  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    cargoName: '',
    totalWeight: '',
    maxSingleWeight: '',
    length: '',
    width: '',
    height: '',
    expectedTime: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [30.572, 104.066],
      zoom: 11,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map

    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      if (selectMode === 'pickup') {
        setPickup({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
        if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current)
        pickupMarkerRef.current = L.marker([lat, lng], { icon: pickupIcon }).addTo(map)
          .bindPopup(`<b>起吊点</b><br/>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup()
        setSelectMode(null)

        const found = serviceProviders.some(p => {
          const d = haversineDistance(lat, lng, p.lat, p.lng)
          return d <= p.radius
        })
        setHasLocalProvider(found)
      } else if (selectMode === 'delivery') {
        setDelivery({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
        if (deliveryMarkerRef.current) map.removeLayer(deliveryMarkerRef.current)
        deliveryMarkerRef.current = L.marker([lat, lng], { icon: deliveryIcon }).addTo(map)
          .bindPopup(`<b>送达点</b><br/>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup()
        setSelectMode(null)
      }
    }

    map.on('click', handleClick)
    return () => { map.off('click', handleClick) }
  }, [selectMode])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (lineRef.current) { map.removeLayer(lineRef.current); lineRef.current = null }

    if (pickup && delivery) {
      const d = haversineDistance(pickup.lat, pickup.lng, delivery.lat, delivery.lng)
      setDistance(d)

      lineRef.current = L.polyline(
        [[pickup.lat, pickup.lng], [delivery.lat, delivery.lng]],
        { color: '#00d4ff', weight: 3, dashArray: '10 6', opacity: 0.8 }
      ).addTo(map)

      map.fitBounds([[pickup.lat, pickup.lng], [delivery.lat, delivery.lng]], { padding: [60, 60] })
    }
  }, [pickup, delivery])

  const handleInput = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = () => {
    if (!pickup || !delivery) {
      showToast('请在地图上选择起吊点和送达点', 'error')
      return
    }
    if (!form.clientName || !form.clientPhone || !form.cargoName || !form.totalWeight) {
      showToast('请填写必要信息', 'error')
      return
    }

    // 转换为用户端订单格式
    const demandForm = {
      pickupAddress: pickup.label || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`,
      deliveryAddress: delivery.label || `${delivery.lat.toFixed(4)}, ${delivery.lng.toFixed(4)}`,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      deliveryLat: delivery.lat,
      deliveryLng: delivery.lng,
      horizontalDistanceKm: distance,
      verticalDistanceMeters: 0,
      cargoName: form.cargoName,
      totalWeightKg: Number(form.totalWeight),
      maxSingleWeightKg: Number(form.maxSingleWeight) || 0,
      lengthCm: Number(form.length) || 0,
      widthCm: Number(form.width) || 0,
      heightCm: Number(form.height) || 0,
      expectedDate: form.expectedTime || new Date().toISOString().split('T')[0],
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      remark: ''
    }

    try {
      // 使用用户端的createDemand函数创建订单
      const orderId = createDemand(demandForm)
      
      // 将订单同步到服务商端
      const providerOrder = {
        id: orderId,
        createdAt: Date.now(),
        expectedAt: form.expectedTime ? new Date(form.expectedTime).getTime() : Date.now() + 24 * 60 * 60 * 1000,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        pickupPoint: {
          label: pickup.label || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`,
          lat: pickup.lat,
          lng: pickup.lng
        },
        deliveryPoint: {
          label: delivery.label || `${delivery.lat.toFixed(4)}, ${delivery.lng.toFixed(4)}`,
          lat: delivery.lat,
          lng: delivery.lng
        },
        horizontalDistanceM: distance * 1000,
        verticalDistanceM: 0,
        cargo: {
          name: form.cargoName,
          totalWeightKg: Number(form.totalWeight),
          maxSingleWeightKg: Number(form.maxSingleWeight) || 0,
          lengthCm: Number(form.length) || 0,
          widthCm: Number(form.width) || 0,
          heightCm: Number(form.height) || 0
        },
        lifecycleStatus: 'in_progress',
        currentNode: 'provider_accept',
        quotes: [],
        timeline: [
          {
            node: 'demand_submitted',
            at: Date.now(),
            operatorRole: 'user',
            operatorName: form.clientName,
            note: '客户提交需求'
          }
        ]
      }
      
      // 获取服务商端的订单列表
      const storageKey = 'shandiao.providerWeb.v1'
      const raw = localStorage.getItem(storageKey)
      const providerData = raw ? JSON.parse(raw) : { orders: [] }
      
      // 添加新订单
      providerData.orders.unshift(providerOrder)
      
      // 保存回localStorage
      localStorage.setItem(storageKey, JSON.stringify(providerData))
      
    } catch (e) {
      console.error('创建订单失败:', e)
      showToast('创建订单失败，请重试', 'error')
      return
    }
    
    setSubmitted(true)
    showToast('需求发布成功！客服将尽快联系您', 'success')
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="container mx-auto px-6 flex items-center justify-center min-h-[60vh] relative">
          <Card className="max-w-md w-full text-center bg-secondary/30 backdrop-blur-sm border-border/30 animate-scale-in">
            <CardContent className="p-12">
              <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-neon rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-neon flex items-center justify-center shadow-neon-lg">
                    <CheckCircle className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
              <h2 className="text-3xl font-black mb-4 text-gradient">需求发布成功</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                您的吊运需求已提交，我们的客服团队将在30分钟内与您联系确认详情。
              </p>
              <Button variant="default" onClick={() => setSubmitted(false)} className="group bg-blue-500 text-white hover:bg-blue-600">
                <Zap className="w-4 h-4 mr-2" />
                继续发布新需求
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const inputCls = "w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-neon-blue/50 focus:shadow-neon transition-all duration-300"

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      <div className="container mx-auto px-6 relative">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-4">
            <Sparkles className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-medium">快速发布</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            发布<span className="text-gradient">吊运需求</span>
          </h1>
          <p className="text-muted-foreground text-lg">在地图上选择起吊点与送达点，填写物资信息即可快速发布</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card className="overflow-hidden bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-4 border-b border-border/30">
                  <Button
                    variant={selectMode === 'pickup' ? 'premium' : 'glow'}
                    size="sm"
                    onClick={() => setSelectMode('pickup')}
                    className="group"
                  >
                    <MapPin className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                    {pickup ? '重选起吊点' : '选择起吊点'}
                  </Button>
                  <Button
                    variant={selectMode === 'delivery' ? 'premium' : 'glow'}
                    size="sm"
                    onClick={() => setSelectMode('delivery')}
                    className="group"
                  >
                    <Navigation className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                    {delivery ? '重选送达点' : '选择送达点'}
                  </Button>
                  {distance > 0 && (
                    <span className="ml-auto text-sm font-bold text-gradient">
                      直线距离: {distance.toFixed(1)} km
                    </span>
                  )}
                </div>

                {selectMode && (
                  <div className="px-4 py-3 bg-neon-blue/10 text-neon-blue text-sm font-medium flex items-center gap-2 border-b border-border/30">
                    <Info className="w-4 h-4 animate-pulse" />
                    请在地图上点击选择{selectMode === 'pickup' ? '起吊点' : '送达点'}
                  </div>
                )}

                <div ref={mapRef} className="h-[500px]" />

                {hasLocalProvider !== null && (
                  <div className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${hasLocalProvider ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-orange/10 text-neon-orange'}`}>
                    <Info className="w-4 h-4" />
                    {hasLocalProvider
                      ? '已匹配本地服务商，可快速响应'
                      : '该区域暂无本地服务商，将由总部统一调度'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-gradient-neon flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  联系信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">联系人</label>
                  <input className={inputCls} placeholder="您的姓名或单位" value={form.clientName} onChange={e => handleInput('clientName', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">联系电话</label>
                  <input className={inputCls} placeholder="手机号码" value={form.clientPhone} onChange={e => handleInput('clientPhone', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  物资信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">物资名称 *</label>
                  <input className={inputCls} placeholder="如: 输电塔钢构件" value={form.cargoName} onChange={e => handleInput('cargoName', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">总重量(kg) *</label>
                    <input type="number" className={inputCls} placeholder="500" value={form.totalWeight} onChange={e => handleInput('totalWeight', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">单件限重(kg)</label>
                    <input type="number" className={inputCls} placeholder="50" value={form.maxSingleWeight} onChange={e => handleInput('maxSingleWeight', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">长(cm)</label>
                    <input type="number" className={inputCls} placeholder="120" value={form.length} onChange={e => handleInput('length', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">宽(cm)</label>
                    <input type="number" className={inputCls} placeholder="60" value={form.width} onChange={e => handleInput('width', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">高(cm)</label>
                    <input type="number" className={inputCls} placeholder="40" value={form.height} onChange={e => handleInput('height', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  期望时间
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.expectedTime}
                  onChange={e => handleInput('expectedTime', e.target.value)}
                />
              </CardContent>
            </Card>

            <Button
              variant="default"
              size="xl"
              className="w-full bg-blue-500 text-white hover:bg-blue-600 group"
              onClick={handleSubmit}
            >
              <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              提交需求
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
