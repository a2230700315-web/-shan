import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useProviderWeb } from '../store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { haversineDistance } from '@/lib/utils'
import { MapPin, Navigation, Package, Phone, User, Info } from 'lucide-react'
import L from 'leaflet'

type DistanceUnit = 'km' | 'm'

function formatDistance(km: number) {
  if (km < 1) return { value: Math.round(km * 1000), unit: 'm' as const }
  return { value: Number(km.toFixed(1)), unit: 'km' as const }
}

interface OfflineOrderForm {
  clientName: string
  clientPhone: string
  pickupAddress: string
  deliveryAddress: string
  pickupLat: string
  pickupLng: string
  deliveryLat: string
  deliveryLng: string
  horizontalOverride: string
  horizontalUnit: DistanceUnit
  verticalDistanceMeters: string
  cargoName: string
  totalWeightKg: number
  maxSingleWeightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  expectedDate: string
  remark: string
}

export default function OfflineOrdersPage() {
  const { orders, session, addOrder } = useProviderWeb()
  
  const [form, setForm] = useState<OfflineOrderForm>({
    clientName: '',
    clientPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    pickupLat: '',
    pickupLng: '',
    deliveryLat: '',
    deliveryLng: '',
    horizontalOverride: '',
    horizontalUnit: 'km',
    verticalDistanceMeters: '',
    cargoName: '',
    totalWeightKg: 0,
    maxSingleWeightKg: 0,
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    expectedDate: '',
    remark: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // 检查是否有权限（客服或管理员）
  const canSubmit = session.role === 'admin' || session.role === 'service'

  // 地图相关状态
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const deliveryMarkerRef = useRef<L.Marker | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)
  const [selectMode, setSelectMode] = useState<'pickup' | 'delivery' | null>(null)

  // 地图图标
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

  // 初始化地图
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

  // 地图点击事件
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      if (selectMode === 'pickup') {
        setForm(prev => ({
          ...prev,
          pickupLat: lat.toString(),
          pickupLng: lng.toString(),
          pickupAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }))
        if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current)
        pickupMarkerRef.current = L.marker([lat, lng], { icon: pickupIcon }).addTo(map)
          .bindPopup(`<b>起吊点</b><br/>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup()
        setSelectMode(null)
      } else if (selectMode === 'delivery') {
        setForm(prev => ({
          ...prev,
          deliveryLat: lat.toString(),
          deliveryLng: lng.toString(),
          deliveryAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }))
        if (deliveryMarkerRef.current) map.removeLayer(deliveryMarkerRef.current)
        deliveryMarkerRef.current = L.marker([lat, lng], { icon: deliveryIcon }).addTo(map)
          .bindPopup(`<b>送达点</b><br/>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup()
        setSelectMode(null)
      }
    }

    map.on('click', handleClick)
    return () => { map.off('click', handleClick) }
  }, [selectMode])

  // 更新地图标记和连线
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const pLat = Number(form.pickupLat)
    const pLng = Number(form.pickupLng)
    const dLat = Number(form.deliveryLat)
    const dLng = Number(form.deliveryLng)

    // 更新起吊点标记
    if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current)
      pickupMarkerRef.current = null
    }
    if (form.pickupLat && form.pickupLng && Number.isFinite(pLat) && Number.isFinite(pLng)) {
      pickupMarkerRef.current = L.marker([pLat, pLng], { icon: pickupIcon }).addTo(map)
        .bindPopup(`<b>起吊点</b><br/>${pLat.toFixed(4)}, ${pLng.toFixed(4)}`)
    }

    // 更新送达点标记
    if (deliveryMarkerRef.current) {
      map.removeLayer(deliveryMarkerRef.current)
      deliveryMarkerRef.current = null
    }
    if (form.deliveryLat && form.deliveryLng && Number.isFinite(dLat) && Number.isFinite(dLng)) {
      deliveryMarkerRef.current = L.marker([dLat, dLng], { icon: deliveryIcon }).addTo(map)
        .bindPopup(`<b>送达点</b><br/>${dLat.toFixed(4)}, ${dLng.toFixed(4)}`)
    }

    // 更新连线
    if (lineRef.current) {
      map.removeLayer(lineRef.current)
      lineRef.current = null
    }
    if (form.pickupLat && form.pickupLng && form.deliveryLat && form.deliveryLng &&
        Number.isFinite(pLat) && Number.isFinite(pLng) && Number.isFinite(dLat) && Number.isFinite(dLng)) {
      lineRef.current = L.polyline(
        [[pLat, pLng], [dLat, dLng]],
        { color: '#00d4ff', weight: 3, dashArray: '10 6', opacity: 0.8 }
      ).addTo(map)
      map.fitBounds([[pLat, pLng], [dLat, dLng]], { padding: [60, 60] })
    }
  }, [form.pickupLat, form.pickupLng, form.deliveryLat, form.deliveryLng])

  // 距离计算逻辑
  const computedKm = useMemo(() => {
    const pLat = Number(form.pickupLat)
    const pLng = Number(form.pickupLng)
    const dLat = Number(form.deliveryLat)
    const dLng = Number(form.deliveryLng)
    if (!Number.isFinite(pLat) || !Number.isFinite(pLng) || !Number.isFinite(dLat) || !Number.isFinite(dLng)) return null
    return haversineDistance(pLat, pLng, dLat, dLng)
  }, [form.pickupLat, form.pickupLng, form.deliveryLat, form.deliveryLng])

  const horizontalKm = useMemo(() => {
    if (form.horizontalOverride.trim()) {
      const n = Number(form.horizontalOverride)
      if (!Number.isFinite(n) || n < 0) return null
      return form.horizontalUnit === 'm' ? n / 1000 : n
    }
    return computedKm
  }, [computedKm, form.horizontalOverride, form.horizontalUnit])

  const distanceDisplay = useMemo(() => {
    if (horizontalKm == null) return null
    return formatDistance(horizontalKm)
  }, [horizontalKm])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name.includes('Kg') || name.includes('Cm') ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit) return
    
    // 表单验证
    if (!form.pickupAddress.trim() || !form.deliveryAddress.trim()) {
      alert('请填写起始点地址与送达点地址')
      return
    }
    if (horizontalKm == null) {
      alert('请填写或计算水平距离（支持手动修正）')
      return
    }
    const vertical = form.verticalDistanceMeters.trim() ? Number(form.verticalDistanceMeters) : 0
    if (!Number.isFinite(vertical) || vertical < 0) {
      alert('垂直距离必须为非负数字')
      return
    }
    if (!form.cargoName.trim()) {
      alert('请填写物资名称')
      return
    }
    if (form.totalWeightKg <= 0) {
      alert('请填写总重量（kg）')
      return
    }
    if (form.maxSingleWeightKg <= 0) {
      alert('请填写单件最大质量（kg）')
      return
    }
    if (form.lengthCm <= 0 || form.widthCm <= 0 || form.heightCm <= 0) {
      alert('请填写体积（长宽高 cm）')
      return
    }
    if (!form.expectedDate.trim()) {
      alert('请选择期望日期')
      return
    }
    if (!form.clientName.trim() || !form.clientPhone.trim()) {
      alert('请填写联系人与联系电话')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 创建新的线下订单
      const orderId = `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const now = Date.now()
      
      // 构建订单数据
      const offlineOrder = {
        id: orderId,
        createdAt: now,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        pickupPoint: {
          label: form.pickupAddress,
          location: {
            latitude: form.pickupLat.trim() ? Number(form.pickupLat) : 0,
            longitude: form.pickupLng.trim() ? Number(form.pickupLng) : 0
          }
        },
        deliveryPoint: {
          label: form.deliveryAddress,
          location: {
            latitude: form.deliveryLat.trim() ? Number(form.deliveryLat) : 0,
            longitude: form.deliveryLng.trim() ? Number(form.deliveryLng) : 0
          }
        },
        horizontalDistanceM: horizontalKm * 1000,
        verticalDistanceM: vertical,
        cargo: {
          name: form.cargoName,
          totalWeightKg: form.totalWeightKg,
          maxSingleWeightKg: form.maxSingleWeightKg,
          lengthCm: form.lengthCm,
          widthCm: form.widthCm,
          heightCm: form.heightCm
        },
        expectedAt: new Date(form.expectedDate).getTime(),
        quotes: [],
        assignment: null,
        workResult: null,
        invoice: null,
        receipt: null,
        timeline: [
          {
            node: 'demand_submitted',
            at: now,
            note: '线下业务录入'
          }
        ],
        currentNode: 'demand_submitted',
        lifecycleStatus: 'in_progress',
        remark: form.remark,
        createdBy: session.employeeId || 'offline'
      }
      
      // 添加订单到系统
      addOrder(offlineOrder as any)
      console.log('创建线下订单:', offlineOrder)
      
      // 同步订单到客户端
      try {
        const userStorageKey = 'shandiao.user-web.v3.1'
        const userRaw = localStorage.getItem(userStorageKey)
        const userData = userRaw ? JSON.parse(userRaw) : { orders: [], messages: [] }
        
        // 构建客户端订单格式
        const userOrder = {
          id: orderId,
          lifecycleStatus: 'open' as const,
          createdAt: now,
          updatedAt: now,
          demand: {
            pickupAddress: form.pickupAddress,
            deliveryAddress: form.deliveryAddress,
            pickupLat: form.pickupLat.trim() ? Number(form.pickupLat) : null,
            pickupLng: form.pickupLng.trim() ? Number(form.pickupLng) : null,
            deliveryLat: form.deliveryLat.trim() ? Number(form.deliveryLat) : null,
            deliveryLng: form.deliveryLng.trim() ? Number(form.deliveryLng) : null,
            horizontalDistanceKm: horizontalKm,
            verticalDistanceMeters: vertical,
            cargoName: form.cargoName,
            totalWeightKg: form.totalWeightKg,
            maxSingleWeightKg: form.maxSingleWeightKg,
            lengthCm: form.lengthCm,
            widthCm: form.widthCm,
            heightCm: form.heightCm,
            expectedDate: form.expectedDate,
            clientName: form.clientName,
            clientPhone: form.clientPhone,
            remark: form.remark || null
          },
          currentNode: 'submit_demand' as const,
          nodes: [
            {
              key: 'submit_demand',
              label: '提交需求',
              operatorLabel: '线下录入',
              time: now,
              remark: '线下业务录入'
            },
            {
              key: 'provider_accept',
              label: '服务商接单',
              operatorLabel: '服务商',
              time: null
            },
            {
              key: 'provider_quote',
              label: '服务商报价',
              operatorLabel: '服务商',
              time: null
            },
            {
              key: 'user_confirm_quote',
              label: '客户确认报价',
              operatorLabel: '客户',
              time: null
            },
            {
              key: 'resource_assign',
              label: '资源分配',
              operatorLabel: '服务商',
              time: null
            },
            {
              key: 'depart_to_site',
              label: '出发到现场',
              operatorLabel: '飞手',
              time: null
            },
            {
              key: 'start_work',
              label: '开始作业',
              operatorLabel: '飞手',
              time: null
            },
            {
              key: 'finish_work',
              label: '完成作业',
              operatorLabel: '飞手',
              time: null
            },
            {
              key: 'issue_invoice',
              label: '开具发票',
              operatorLabel: '财务',
              time: null
            },
            {
              key: 'user_review',
              label: '客户评价',
              operatorLabel: '客户',
              time: null
            }
          ],
          quoteRounds: [],
          awaitingUserQuoteDecision: false,
          acceptDeadlineAt: now + 2 * 60 * 60 * 1000 // 2小时后
        }
        
        // 添加到客户端订单列表
        const existingOrders = userData.orders || []
        const orderIndex = existingOrders.findIndex((o: any) => o.id === orderId)
        if (orderIndex >= 0) {
          existingOrders[orderIndex] = userOrder
        } else {
          existingOrders.unshift(userOrder)
        }
        
        // 添加客户端消息
        const newMessage = {
          id: `MSG-${now}-${Math.floor(Math.random() * 100000)}`,
          orderId: orderId,
          title: '新订单创建',
          content: `您的线下业务订单 ${orderId} 已创建成功，服务商将尽快处理。`,
          channel: 'inbox' as const,
          createdAt: now,
          readAt: null
        }
        const existingMessages = userData.messages || []
        existingMessages.unshift(newMessage)
        
        // 保存回localStorage
        userData.orders = existingOrders
        userData.messages = existingMessages
        localStorage.setItem(userStorageKey, JSON.stringify(userData))
        console.log('同步订单到客户端成功')
      } catch (e) {
        console.error('同步订单到客户端失败:', e)
      }
      
      // 显示成功消息
      setSuccess(true)
      
      // 重置表单
      setForm({
        clientName: '',
        clientPhone: '',
        pickupAddress: '',
        deliveryAddress: '',
        pickupLat: '',
        pickupLng: '',
        deliveryLat: '',
        deliveryLng: '',
        horizontalOverride: '',
        horizontalUnit: 'km',
        verticalDistanceMeters: '',
        cargoName: '',
        totalWeightKg: 0,
        maxSingleWeightKg: 0,
        lengthCm: 0,
        widthCm: 0,
        heightCm: 0,
        expectedDate: '',
        remark: '',
      })
      
      // 3秒后隐藏成功消息
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">线下业务录入</h1>
        <div className="text-sm text-muted-foreground">
          当前角色：{session.role === 'admin' ? '管理员' : '客服'}
        </div>
      </div>

      {!canSubmit && (
        <div className="p-4 mb-6 rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="font-semibold text-destructive">权限不足</div>
          <div className="text-sm text-destructive/80 mt-1">
            只有管理员和客服角色可以录入线下业务
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 rounded-xl border border-accent/20 bg-accent/5">
          <div className="font-semibold text-accent">提交成功</div>
          <div className="text-sm text-accent/80 mt-1">
            线下业务信息已成功录入
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* 地图卡片 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4 text-accent" />
                  地图选点
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={selectMode === 'pickup' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectMode('pickup')}
                    disabled={!canSubmit}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    {form.pickupLat ? '重选起吊点' : '选择起吊点'}
                  </Button>
                  <Button
                    type="button"
                    variant={selectMode === 'delivery' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectMode('delivery')}
                    disabled={!canSubmit}
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    {form.deliveryLat ? '重选送达点' : '选择送达点'}
                  </Button>
                  {horizontalKm != null && horizontalKm > 0 && (
                    <span className="text-sm font-bold text-accent ml-2">
                      距离: {distanceDisplay?.value}{distanceDisplay?.unit}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectMode && (
                <div className="px-4 py-3 bg-accent/10 text-accent text-sm font-medium flex items-center gap-2 border-b">
                  <Info className="w-4 h-4" />
                  请在地图上点击选择{selectMode === 'pickup' ? '起吊点' : '送达点'}
                </div>
              )}
              <div ref={mapRef} className="h-[400px] w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-accent" />
                地址与距离
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">起始点地址 *</label>
                  <input
                    type="text"
                    id="pickupAddress"
                    name="pickupAddress"
                    value={form.pickupAddress}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="地图选点/文字输入"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">送达点地址 *</label>
                  <input
                    type="text"
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={form.deliveryAddress}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="地图选点/文字输入"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">起点经纬度（可选，用于自动测距）</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      id="pickupLat"
                      name="pickupLat"
                      value={form.pickupLat}
                      onChange={handleChange}
                      disabled={!canSubmit}
                      placeholder="lat"
                      inputMode="decimal"
                      className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="text"
                      id="pickupLng"
                      name="pickupLng"
                      value={form.pickupLng}
                      onChange={handleChange}
                      disabled={!canSubmit}
                      placeholder="lng"
                      inputMode="decimal"
                      className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">终点经纬度（可选，用于自动测距）</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      id="deliveryLat"
                      name="deliveryLat"
                      value={form.deliveryLat}
                      onChange={handleChange}
                      disabled={!canSubmit}
                      placeholder="lat"
                      inputMode="decimal"
                      className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="text"
                      id="deliveryLng"
                      name="deliveryLng"
                      value={form.deliveryLng}
                      onChange={handleChange}
                      disabled={!canSubmit}
                      placeholder="lng"
                      inputMode="decimal"
                      className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">水平距离（自动计算/可手动修正） *</label>
                  <input
                    type="text"
                    id="horizontalOverride"
                    name="horizontalOverride"
                    value={form.horizontalOverride}
                    onChange={handleChange}
                    disabled={!canSubmit}
                    placeholder={computedKm == null ? '请输入距离' : `留空使用自动计算：${computedKm.toFixed(1)} km`}
                    inputMode="decimal"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>单位</span>
                    <select
                      id="horizontalUnit"
                      name="horizontalUnit"
                      value={form.horizontalUnit}
                      onChange={handleChange}
                      disabled={!canSubmit}
                      className="h-8 px-2 rounded-lg border bg-secondary/30"
                    >
                      <option value="km">km</option>
                      <option value="m">m</option>
                    </select>
                    {distanceDisplay && (
                      <span className="ml-auto font-semibold text-foreground">
                        当前：{distanceDisplay.value}{distanceDisplay.unit}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">垂直距离（m，默认自动估算） *</label>
                  <input
                    type="text"
                    id="verticalDistanceMeters"
                    name="verticalDistanceMeters"
                    value={form.verticalDistanceMeters}
                    onChange={handleChange}
                    disabled={!canSubmit}
                    placeholder="留空默认 0，可手动修改"
                    inputMode="decimal"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">期望日期 *</label>
                  <input
                    type="date"
                    id="expectedDate"
                    name="expectedDate"
                    value={form.expectedDate}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="w-4 h-4 text-accent" />
                物资信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">物资名称 *</label>
                <input
                  type="text"
                  id="cargoName"
                  name="cargoName"
                  value={form.cargoName}
                  onChange={handleChange}
                  required
                  disabled={!canSubmit}
                  placeholder="具体名称"
                  className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">总重量（kg） *</label>
                  <input
                    type="number"
                    id="totalWeightKg"
                    name="totalWeightKg"
                    min="0"
                    step="0.1"
                    value={form.totalWeightKg}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="数字输入"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">单件最大质量（kg） *</label>
                  <input
                    type="number"
                    id="maxSingleWeightKg"
                    name="maxSingleWeightKg"
                    min="0"
                    step="0.1"
                    value={form.maxSingleWeightKg}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="数字输入"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">长（cm） *</label>
                  <input
                    type="number"
                    id="lengthCm"
                    name="lengthCm"
                    min="0"
                    step="0.1"
                    value={form.lengthCm}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="长"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">宽（cm） *</label>
                  <input
                    type="number"
                    id="widthCm"
                    name="widthCm"
                    min="0"
                    step="0.1"
                    value={form.widthCm}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="宽"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">高（cm） *</label>
                  <input
                    type="number"
                    id="heightCm"
                    name="heightCm"
                    min="0"
                    step="0.1"
                    value={form.heightCm}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="高"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4 text-accent" />
                联系方式
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">联系人 *</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  required
                  disabled={!canSubmit}
                  placeholder="文本输入"
                  className="w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">联系电话 *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    id="clientPhone"
                    name="clientPhone"
                    value={form.clientPhone}
                    onChange={handleChange}
                    required
                    disabled={!canSubmit}
                    placeholder="手机号"
                    inputMode="tel"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">备注说明（选填）</label>
                <textarea
                  id="remark"
                  name="remark"
                  value={form.remark}
                  onChange={handleChange}
                  disabled={!canSubmit}
                  placeholder="特殊要求"
                  className="w-full min-h-24 px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            disabled={!canSubmit || isSubmitting}
            className="w-full h-14 px-10 rounded-2xl text-lg font-semibold"
          >
            {isSubmitting ? '提交中...' : '提交线下业务'}
          </Button>

          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 mt-0.5 text-accent" />
                <div>
                  <div className="font-semibold text-foreground mb-1">说明</div>
                  <div>线下业务录入后，系统将自动创建订单并通知客服或管理员进行接单处理。</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">已录入的线下业务</h2>
        <div className="grid grid-cols-1 gap-4">
          {orders.filter(order => order.id.startsWith('OFFLINE-')).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无线下业务记录
            </div>
          ) : (
            orders
              .filter(order => order.id.startsWith('OFFLINE-'))
              .map(order => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle>订单号：{order.id}</CardTitle>
                    <CardDescription>创建时间：{new Date(order.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div><strong>客户：</strong>{order.clientName} ({order.clientPhone})</div>
                      <div><strong>起始地址：</strong>{order.pickupPoint.label}</div>
                      <div><strong>送达地址：</strong>{order.deliveryPoint.label}</div>
                      <div><strong>物资：</strong>{order.cargo.name}</div>
                      <div><strong>状态：</strong>{order.lifecycleStatus === 'in_progress' ? '处理中' : '已完成'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  )
}
