import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, getStatusLabel } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { Boxes, Plane, Truck, Anchor, Wrench, CheckCircle } from 'lucide-react'

type ResourceTab = 'drones' | 'vehicles' | 'riggings'

export default function ResourcesPage() {
  const { drones, updateDrone, vehicles, riggings, showToast } = useApp()
  const [tab, setTab] = useState<ResourceTab>('drones')

  const tabs = [
    { value: 'drones' as const, label: '无人机', icon: Plane, count: drones.length },
    { value: 'vehicles' as const, label: '作业车辆', icon: Truck, count: vehicles.length },
    { value: 'riggings' as const, label: '吊具', icon: Anchor, count: riggings.length },
  ]

  const toggleDroneStatus = (id: string, current: string) => {
    const next = current === 'available' ? 'maintenance' : 'available'
    updateDrone(id, { status: next as 'available' | 'maintenance' })
    showToast(`设备状态已更新为「${getStatusLabel(next)}」`)
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Boxes className="w-8 h-8 text-accent" />
            资源管理
          </h1>
          <p className="text-muted-foreground">固定资产登记与状态管理</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t.value
                    ? 'bg-primary/10 text-accent shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                <span className="text-xs opacity-60">{t.count}</span>
              </button>
            )
          })}
        </div>

        {/* Drones */}
        {tab === 'drones' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drones.map(drone => (
              <Card key={drone.id} className="hover:shadow-card-hover transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{drone.model}</CardTitle>
                    <StatusBadge variant={drone.status}>{getStatusLabel(drone.status)}</StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">SN码</span>
                      <span className="font-mono text-xs">{drone.sn}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">最大载荷</span>
                      <span className="font-semibold">{drone.maxPayload}kg</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">保险有效期</span>
                      <span className="text-xs">{drone.insuranceExpiry}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">累计飞行</span>
                      <span className="font-semibold">{drone.totalFlightHours}h</span>
                    </div>
                  </div>
                  {drone.status !== 'in_use' && (
                    <Button
                      variant={drone.status === 'available' ? 'outline' : 'default'}
                      size="sm"
                      className="w-full"
                      onClick={() => toggleDroneStatus(drone.id, drone.status)}
                    >
                      {drone.status === 'available' ? (
                        <><Wrench className="w-3.5 h-3.5 mr-1.5" />标记维修</>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />标记可用</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vehicles */}
        {tab === 'vehicles' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <Card key={v.id} className="hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-bold">{v.plate}</div>
                        <div className="text-xs text-muted-foreground">{v.type}</div>
                      </div>
                    </div>
                    <StatusBadge variant={v.status}>{getStatusLabel(v.status)}</StatusBadge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Riggings */}
        {tab === 'riggings' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riggings.map(r => (
              <Card key={r.id} className="hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Anchor className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-bold">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.type} · 最大{r.maxLoad}kg</div>
                      </div>
                    </div>
                    <StatusBadge variant={r.status}>{getStatusLabel(r.status)}</StatusBadge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
