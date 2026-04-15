import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/lib/store'
import type { UserRole } from '@/lib/types'
import { Users, Shield, Headphones, Plane, Calculator, ClipboardList } from 'lucide-react'

const roleLabels: Record<UserRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: '管理员', icon: Shield, color: 'text-destructive' },
  service: { label: '客服/销售', icon: Headphones, color: 'text-success' },
  pilot: { label: '飞手/地勤', icon: Plane, color: 'text-warning' },
  finance: { label: '财务', icon: Calculator, color: 'text-accent' },
  client: { label: '用户', icon: Users, color: 'text-muted-foreground' },
}

export default function EmployeesPage() {
  const { employees } = useApp()

  const grouped = employees.reduce<Record<string, typeof employees>>((acc, emp) => {
    const key = emp.role
    if (!acc[key]) acc[key] = []
    acc[key].push(emp)
    return acc
  }, {})

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-accent" />
            员工管理
          </h1>
          <p className="text-muted-foreground">团队档案与绩效记录</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(grouped).map(([role, emps]) => {
            const config = roleLabels[role as UserRole]
            const Icon = config.icon
            return (
              <Card key={role} className="hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-black">{emps.length}</div>
                    <div className="text-xs text-muted-foreground">{config.label}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Employee list */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-muted-foreground">姓名</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">角色</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">电话</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">入职日期</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">完成订单</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const config = roleLabels[emp.role]
                    const Icon = config.icon
                    return (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <span className="font-semibold">{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{emp.phone}</td>
                        <td className="p-4 text-muted-foreground">{emp.joinDate}</td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1.5 font-bold">
                            <ClipboardList className="w-3.5 h-3.5 text-accent" />
                            {emp.completedOrders}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
