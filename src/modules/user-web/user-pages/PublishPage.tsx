import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { haversineDistance } from '@/lib/utils'
import { MapPin, Navigation, Package, Phone, User, Send } from 'lucide-react'
import { useUserWeb } from '../state/UserWebStore'

type DistanceUnit = 'km' | 'm'

function formatDistance(km: number) {
  if (km < 1) return { value: Math.round(km * 1000), unit: 'm' as const }
  return { value: Number(km.toFixed(1)), unit: 'km' as const }
}

export default function PublishPage() {
  const navigate = useNavigate()
  const { createDemand, showToast } = useUserWeb()

  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [pickupLat, setPickupLat] = useState<string>('')
  const [pickupLng, setPickupLng] = useState<string>('')
  const [deliveryLat, setDeliveryLat] = useState<string>('')
  const [deliveryLng, setDeliveryLng] = useState<string>('')

  const [horizontalOverride, setHorizontalOverride] = useState<string>('') // meters or km via UI
  const [horizontalUnit, setHorizontalUnit] = useState<DistanceUnit>('km')
  const [verticalDistanceMeters, setVerticalDistanceMeters] = useState<string>('') // default empty -> auto 0

  const [cargoName, setCargoName] = useState('')
  const [totalWeightKg, setTotalWeightKg] = useState<string>('')
  const [maxSingleWeightKg, setMaxSingleWeightKg] = useState<string>('')
  const [lengthCm, setLengthCm] = useState<string>('')
  const [widthCm, setWidthCm] = useState<string>('')
  const [heightCm, setHeightCm] = useState<string>('')
  const [expectedDate, setExpectedDate] = useState<string>('') // yyyy-mm-dd
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [remark, setRemark] = useState('')

  const computedKm = useMemo(() => {
    const pLat = Number(pickupLat)
    const pLng = Number(pickupLng)
    const dLat = Number(deliveryLat)
    const dLng = Number(deliveryLng)
    if (!Number.isFinite(pLat) || !Number.isFinite(pLng) || !Number.isFinite(dLat) || !Number.isFinite(dLng)) return null
    return haversineDistance(pLat, pLng, dLat, dLng)
  }, [pickupLat, pickupLng, deliveryLat, deliveryLng])

  const horizontalKm = useMemo(() => {
    if (horizontalOverride.trim()) {
      const n = Number(horizontalOverride)
      if (!Number.isFinite(n) || n < 0) return null
      return horizontalUnit === 'm' ? n / 1000 : n
    }
    return computedKm
  }, [computedKm, horizontalOverride, horizontalUnit])

  const distanceDisplay = useMemo(() => {
    if (horizontalKm == null) return null
    return formatDistance(horizontalKm)
  }, [horizontalKm])

  const inputCls =
    'w-full h-11 px-4 rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all'

  const handleSubmit = () => {
    // 除备注外全必填；距离可自动计算+手动修正
    if (!pickupAddress.trim() || !deliveryAddress.trim()) {
      showToast('请填写起始点地址与送达点地址', 'error')
      return
    }
    if (horizontalKm == null) {
      showToast('请填写或计算水平距离（支持手动修正）', 'error')
      return
    }
    const vertical = verticalDistanceMeters.trim() ? Number(verticalDistanceMeters) : 0
    if (!Number.isFinite(vertical) || vertical < 0) {
      showToast('垂直距离必须为非负数字', 'error')
      return
    }
    if (!cargoName.trim()) {
      showToast('请填写物资名称', 'error')
      return
    }
    const totalWeight = Number(totalWeightKg)
    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
      showToast('请填写总重量（kg）', 'error')
      return
    }
    const maxSingle = Number(maxSingleWeightKg)
    if (!Number.isFinite(maxSingle) || maxSingle <= 0) {
      showToast('请填写单件最大质量（kg）', 'error')
      return
    }
    const len = Number(lengthCm)
    const wid = Number(widthCm)
    const hei = Number(heightCm)
    if (![len, wid, hei].every(v => Number.isFinite(v) && v > 0)) {
      showToast('请填写体积（长宽高 cm）', 'error')
      return
    }
    if (!expectedDate.trim()) {
      showToast('请选择期望日期', 'error')
      return
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      showToast('请填写联系人与联系电话', 'error')
      return
    }

    const orderId = createDemand({
      pickupAddress: pickupAddress.trim(),
      deliveryAddress: deliveryAddress.trim(),
      pickupLat: pickupLat.trim() ? Number(pickupLat) : null,
      pickupLng: pickupLng.trim() ? Number(pickupLng) : null,
      deliveryLat: deliveryLat.trim() ? Number(deliveryLat) : null,
      deliveryLng: deliveryLng.trim() ? Number(deliveryLng) : null,
      horizontalDistanceKm: horizontalKm,
      verticalDistanceMeters: vertical,
      cargoName: cargoName.trim(),
      totalWeightKg: totalWeight,
      maxSingleWeightKg: maxSingle,
      lengthCm: len,
      widthCm: wid,
      heightCm: hei,
      expectedDate,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      remark: remark.trim() ? remark.trim() : null,
    })

    showToast(`需求已提交，订单号 ${orderId}`)
    navigate(`/client/orders/${encodeURIComponent(orderId)}`)
  }

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">发布吊装需求</h1>
          <p className="text-muted-foreground">按要求填写信息后提交，系统将自动匹配服务商并通过消息通知关键节点。</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
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
                    <input className={inputCls} value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} placeholder="地图选点/文字输入" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">送达点地址 *</label>
                    <input className={inputCls} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="地图选点/文字输入" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">起点经纬度（可选，用于自动测距）</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} value={pickupLat} onChange={e => setPickupLat(e.target.value)} placeholder="lat" inputMode="decimal" />
                      <input className={inputCls} value={pickupLng} onChange={e => setPickupLng(e.target.value)} placeholder="lng" inputMode="decimal" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">终点经纬度（可选，用于自动测距）</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} value={deliveryLat} onChange={e => setDeliveryLat(e.target.value)} placeholder="lat" inputMode="decimal" />
                      <input className={inputCls} value={deliveryLng} onChange={e => setDeliveryLng(e.target.value)} placeholder="lng" inputMode="decimal" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">水平距离（自动计算/可手动修正） *</label>
                    <input
                      className={inputCls}
                      value={horizontalOverride}
                      onChange={e => setHorizontalOverride(e.target.value)}
                      placeholder={computedKm == null ? '请输入距离' : `留空使用自动计算：${computedKm.toFixed(1)} km`}
                      inputMode="decimal"
                    />
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>单位</span>
                      <select
                        className="h-8 px-2 rounded-lg border bg-secondary/30"
                        value={horizontalUnit}
                        onChange={e => setHorizontalUnit(e.target.value as DistanceUnit)}
                      >
                        <option value="km">km</option>
                        <option value="m">m</option>
                      </select>
                      {distanceDisplay && (
                        <span className="ml-auto font-semibold text-foreground">
                          当前：{distanceDisplay.value}
                          {distanceDisplay.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">垂直距离（m，默认自动估算） *</label>
                    <input className={inputCls} value={verticalDistanceMeters} onChange={e => setVerticalDistanceMeters(e.target.value)} placeholder="留空默认 0，可手动修改" inputMode="decimal" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">期望日期 *</label>
                    <input className={inputCls} type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="w-4 h-4 text-accent" />
                  物资信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">物资名称 *</label>
                  <input className={inputCls} value={cargoName} onChange={e => setCargoName(e.target.value)} placeholder="具体名称" />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">总重量（kg） *</label>
                    <input className={inputCls} value={totalWeightKg} onChange={e => setTotalWeightKg(e.target.value)} placeholder="数字输入" inputMode="decimal" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">单件最大质量（kg） *</label>
                    <input className={inputCls} value={maxSingleWeightKg} onChange={e => setMaxSingleWeightKg(e.target.value)} placeholder="数字输入" inputMode="decimal" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">长（cm） *</label>
                    <input className={inputCls} value={lengthCm} onChange={e => setLengthCm(e.target.value)} placeholder="长" inputMode="decimal" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">宽（cm） *</label>
                    <input className={inputCls} value={widthCm} onChange={e => setWidthCm(e.target.value)} placeholder="宽" inputMode="decimal" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">高（cm） *</label>
                    <input className={inputCls} value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="高" inputMode="decimal" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-accent" />
                  联系方式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">联系人 *</label>
                  <input className={inputCls} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="文本输入" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">联系电话 *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className={`${inputCls} pl-10`} value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="手机号" inputMode="tel" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">备注说明（选填）</label>
                  <textarea className="w-full min-h-24 px-4 py-3 rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-y" value={remark} onChange={e => setRemark(e.target.value)} placeholder="特殊要求" />
                </div>
              </CardContent>
            </Card>

            <button 
              onClick={handleSubmit} 
              className="w-full h-14 px-10 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
              提交需求
            </button>

            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 mt-0.5 text-accent" />
                  <div>
                    <div className="font-semibold text-foreground mb-1">说明</div>
                    <div>平台不介入交易收款；关键节点会通过站内信（以及未来可扩展的微信订阅/短信）通知你。</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

