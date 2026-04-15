import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, getStatusLabel } from '@/components/ui/badge'
import { Boxes, Plane, Truck, Anchor, Wrench, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { ProviderWebProvider, useProviderWeb } from '../store'
import type { FixedAsset, FixedAssetStatus, FixedAssetType } from '../domain/assets'
import type { ProviderRole } from '../domain/types'

function typeLabel(t: FixedAssetType) {
  const m: Record<FixedAssetType, string> = {
    drone: '无人机',
    vehicle: '车辆',
    rigging: '吊具',
    other: '其他',
  }
  return m[t]
}

function roleLabel(r: ProviderRole) {
  const m: Record<ProviderRole, string> = {
    admin: '管理员',
    service: '客服',
    ground: '地勤',
    pilot: '飞手',
    finance: '财务',
  }
  return m[r]
}

function mapStatusToBadge(status: FixedAssetStatus) {
  if (status === 'available') return 'available' as const
  if (status === 'maintenance') return 'maintenance' as const
  return 'in_use' as const
}

function ResourcesInner() {
  const { assets, upsertAsset, removeAsset, resetDemoData, session, setSession } = useProviderWeb()
  const isAdmin = session.role === 'admin'

  const [tab, setTab] = useState<FixedAssetType | 'all'>('all')
  const [draft, setDraft] = useState<FixedAsset | null>(null)

  const filtered = useMemo(() => {
    return assets.filter(a => tab === 'all' ? true : a.type === tab)
  }, [assets, tab])

  const openCreate = () => {
    setDraft({
      id: `a_${Math.random().toString(16).slice(2)}_${Date.now()}`,
      type: 'drone',
      name: '',
      serialOrPlate: '',
      purchasedAt: Date.now(),
      status: 'available',
    })
  }

  const saveDraft = () => {
    if (!draft) return
    if (!draft.name.trim() || !draft.serialOrPlate.trim()) return
    upsertAsset(draft)
    setDraft(null)
  }

  const toggleMaintenance = (a: FixedAsset) => {
    const next: FixedAssetStatus = a.status === 'available' ? 'maintenance' : 'available'
    upsertAsset({ ...a, status: next })
  }

  const switchToAdmin = () => {
    setSession({ role: 'admin', employeeId: 'e_admin' })
  }

  const tabs: { value: typeof tab; label: string; icon: typeof Plane }[] = [
    { value: 'all', label: '全部', icon: Boxes },
    { value: 'drone', label: '无人机', icon: Plane },
    { value: 'vehicle', label: '车辆', icon: Truck },
    { value: 'rigging', label: '吊具', icon: Anchor },
    { value: 'other', label: '其他', icon: Boxes },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        {!isAdmin && (
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-semibold text-amber-600">当前角色：{roleLabel(session.role)}</span>
                <span className="text-muted-foreground ml-2">固定资产管理仅限管理员操作，如需添加/编辑资产请切换角色。</span>
              </div>
              <Button variant="premium" size="sm" onClick={switchToAdmin}>
                切换为管理员
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Boxes className="w-8 h-8 text-accent" />
              固定资产管理
            </h1>
            <p className="text-muted-foreground">无人机/车辆/吊具登记、保险与保养提醒、状态管理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDemoData}>重置演示数据</Button>
            {isAdmin && (
              <Button variant="premium" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                新增资产
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t.value ? 'bg-primary/10 text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <Card key={a.id} className="hover:shadow-card-hover transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">
                    {typeLabel(a.type)} · {a.name}
                  </CardTitle>
                  <StatusBadge variant={mapStatusToBadge(a.status)}>{getStatusLabel(a.status)}</StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">序列号/车牌</span>
                    <span className="font-mono text-xs">{a.serialOrPlate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">购置日期</span>
                    <span className="text-xs">{new Date(a.purchasedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">保险到期</span>
                    <span className="text-xs">{a.insuranceExpiryAt ? new Date(a.insuranceExpiryAt).toLocaleDateString('zh-CN') : '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">保养到期</span>
                    <span className="text-xs">{a.maintenanceDueAt ? new Date(a.maintenanceDueAt).toLocaleDateString('zh-CN') : '—'}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setDraft({ ...a })}>
                      编辑
                    </Button>
                    <Button
                      variant={a.status === 'available' ? 'outline' : 'default'}
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleMaintenance(a)}
                    >
                      {a.status === 'available' ? (<><Wrench className="w-3.5 h-3.5 mr-1.5" />维修</>) : (<><CheckCircle className="w-3.5 h-3.5 mr-1.5" />可用</>)}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => removeAsset(a.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDraft(null)} />
          <Card className="relative w-full max-w-lg z-10">
            <CardHeader className="border-b">
              <CardTitle>{assets.some(a => a.id === draft.id) ? '编辑资产' : '新增资产'}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">类型</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                    value={draft.type}
                    onChange={e => setDraft({ ...draft, type: e.target.value as FixedAssetType })}
                  >
                    {(['drone', 'vehicle', 'rigging', 'other'] as const).map(t => (
                      <option key={t} value={t}>{typeLabel(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">状态</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                    value={draft.status}
                    onChange={e => setDraft({ ...draft, status: e.target.value as FixedAssetStatus })}
                  >
                    <option value="available">可用</option>
                    <option value="maintenance">维修</option>
                    <option value="in_use">使用中</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">名称/型号</label>
                <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">序列号/车牌号</label>
                <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={draft.serialOrPlate} onChange={e => setDraft({ ...draft, serialOrPlate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">保险到期（可选）</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                    value={draft.insuranceExpiryAt ? new Date(draft.insuranceExpiryAt).toISOString().slice(0, 10) : ''}
                    onChange={e => setDraft({ ...draft, insuranceExpiryAt: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">保养到期（可选）</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                    value={draft.maintenanceDueAt ? new Date(draft.maintenanceDueAt).toISOString().slice(0, 10) : ''}
                    onChange={e => setDraft({ ...draft, maintenanceDueAt: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setDraft(null)}>取消</Button>
                <Button variant="premium" className="flex-1" onClick={saveDraft}>保存</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <ProviderWebProvider>
      <ResourcesInner />
    </ProviderWebProvider>
  )
}
