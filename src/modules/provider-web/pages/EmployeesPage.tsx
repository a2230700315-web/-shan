import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Download, Plus, Trash2 } from 'lucide-react'
import { ProviderWebProvider, useProviderWeb } from '../store'
import type { ProviderEmployee, ProviderRole } from '../domain/types'
import { computeGroundPerformance, computePilotPerformance, computeServicePerformance, toCsv } from '../domain/performance'

function roleLabel(r: ProviderRole) {
  const map: Record<ProviderRole, string> = {
    admin: '管理员',
    service: '客服',
    ground: '地勤',
    pilot: '飞手',
    finance: '财务',
  }
  return map[r]
}

function EmployeesInner() {
  const { employees, upsertEmployee, removeEmployee, orders, session, setSession, resetDemoData } = useProviderWeb()

  const pilotPerf = useMemo(() => computePilotPerformance(orders, employees), [employees, orders])
  const servicePerf = useMemo(() => computeServicePerformance(orders, employees), [employees, orders])
  const groundPerf = useMemo(() => computeGroundPerformance(orders, employees), [employees, orders])

  const isAdmin = session.role === 'admin'

  const [draft, setDraft] = useState<ProviderEmployee | null>(null)

  const openCreate = () => {
    setDraft({
      id: `e_${Math.random().toString(16).slice(2)}_${Date.now()}`,
      name: '',
      phone: '',
      role: 'service',
      joinAt: Date.now(),
    })
  }

  const openEdit = (emp: ProviderEmployee) => setDraft({ ...emp })

  const saveDraft = () => {
    if (!draft) return
    if (!draft.name.trim() || !draft.phone.trim()) return
    upsertEmployee(draft)
    setDraft(null)
  }

  const switchToAdmin = () => {
    setSession({ role: 'admin', employeeId: 'e_admin' })
  }

  const exportPerf = () => {
    const csv = toCsv([
      ...pilotPerf.map(p => ({
        角色: '飞手',
        姓名: p.name,
        完成订单: String(p.completedOrders),
        平均作业分钟: p.avgLiftMinutes === null ? '' : p.avgLiftMinutes.toFixed(1),
      })),
      ...servicePerf.map(s => ({
        角色: '客服/管理员',
        姓名: s.name,
        接单数: String(s.acceptedOrders),
        平均报价分钟: s.avgQuoteMinutes === null ? '' : s.avgQuoteMinutes.toFixed(1),
      })),
      ...groundPerf.map(g => ({
        角色: '地勤',
        姓名: g.name,
        出发任务: String(g.departOrders),
        准时率: g.onTimeRate === null ? '' : `${Math.round(g.onTimeRate * 100)}%`,
      })),
    ])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `provider-performance-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        {!isAdmin && (
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-semibold text-amber-600">当前角色：{roleLabel(session.role)}</span>
                <span className="text-muted-foreground ml-2">员工管理仅限管理员操作，如需添加/编辑员工请切换角色。</span>
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
              <Users className="w-8 h-8 text-accent" />
              员工与绩效
            </h1>
            <p className="text-muted-foreground">员工档案（本地演示）+ 按角色绩效统计（来自订单节点时间线）</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDemoData}>重置演示数据</Button>
            <Button variant="premium" onClick={exportPerf}>
              <Download className="w-4 h-4 mr-2" />
              导出绩效 CSV
            </Button>
            {isAdmin && (
              <Button variant="premium" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                新增员工
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">飞手绩效</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-muted-foreground">姓名</th>
                    <th className="text-right p-3 text-muted-foreground">完成</th>
                    <th className="text-right p-3 text-muted-foreground">平均作业(分)</th>
                  </tr>
                </thead>
                <tbody>
                  {pilotPerf.map(p => (
                    <tr key={p.employeeId} className="border-b last:border-0">
                      <td className="p-3 font-semibold">{p.name}</td>
                      <td className="p-3 text-right">{p.completedOrders}</td>
                      <td className="p-3 text-right">{p.avgLiftMinutes === null ? '—' : p.avgLiftMinutes.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">客服绩效（按姓名匹配接单日志）</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-muted-foreground">姓名</th>
                    <th className="text-right p-3 text-muted-foreground">接单</th>
                    <th className="text-right p-3 text-muted-foreground">平均报价(分)</th>
                  </tr>
                </thead>
                <tbody>
                  {servicePerf.map(s => (
                    <tr key={s.employeeId} className="border-b last:border-0">
                      <td className="p-3 font-semibold">{s.name}</td>
                      <td className="p-3 text-right">{s.acceptedOrders}</td>
                      <td className="p-3 text-right">{s.avgQuoteMinutes === null ? '—' : s.avgQuoteMinutes.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">地勤绩效</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-muted-foreground">姓名</th>
                    <th className="text-right p-3 text-muted-foreground">出发</th>
                    <th className="text-right p-3 text-muted-foreground">准时率</th>
                  </tr>
                </thead>
                <tbody>
                  {groundPerf.map(g => (
                    <tr key={g.employeeId} className="border-b last:border-0">
                      <td className="p-3 font-semibold">{g.name}</td>
                      <td className="p-3 text-right">{g.departOrders}</td>
                      <td className="p-3 text-right">{g.onTimeRate === null ? '—' : `${Math.round(g.onTimeRate * 100)}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">员工列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-muted-foreground">姓名</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">角色</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">电话</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">执照/备注</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-semibold">{emp.name}</td>
                      <td className="p-4">{roleLabel(emp.role)}</td>
                      <td className="p-4 text-muted-foreground">{emp.phone}</td>
                      <td className="p-4 text-muted-foreground">{emp.licenseNo ?? '—'}</td>
                      <td className="p-4 text-right">
                        {isAdmin && (
                          <div className="inline-flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(emp)}>编辑</Button>
                            <Button variant="destructive" size="sm" onClick={() => removeEmployee(emp.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDraft(null)} />
          <Card className="relative w-full max-w-lg z-10">
            <CardHeader className="border-b">
              <CardTitle>{employees.some(e => e.id === draft.id) ? '编辑员工' : '新增员工'}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">姓名</label>
                <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">手机号</label>
                <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">角色</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm"
                  value={draft.role}
                  onChange={e => setDraft({ ...draft, role: e.target.value as ProviderRole })}
                >
                  {(['service', 'ground', 'pilot', 'finance', 'admin'] as const).map(r => (
                    <option key={r} value={r}>{roleLabel(r)}</option>
                  ))}
                </select>
              </div>
              {draft.role === 'pilot' && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">执照编号</label>
                  <input className="w-full h-10 px-3 rounded-xl border bg-secondary/50 text-sm" value={draft.licenseNo ?? ''} onChange={e => setDraft({ ...draft, licenseNo: e.target.value })} />
                </div>
              )}
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

export default function EmployeesPage() {
  return (
    <ProviderWebProvider>
      <EmployeesInner />
    </ProviderWebProvider>
  )
}
