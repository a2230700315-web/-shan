import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminConsole } from '../context/AdminConsoleContext'
import { ADMIN_ROUTES } from '../routes'

export default function AdminDashboardPage() {
  const { providers, globalOrders, complaints, messageTemplates, promotionBanners } = useAdminConsole()

  const pendingProviders = providers.filter((p) => p.auditStatus === 'pending').length
  const openComplaints = complaints.filter((c) => c.status !== 'resolved').length

  const cards = [
    { title: '待审核服务商', value: pendingProviders, href: ADMIN_ROUTES.providers, hint: '入驻资质审核' },
    { title: '全平台订单（样例）', value: globalOrders.length, href: ADMIN_ROUTES.orders, hint: '多条件筛选与节点时间线' },
    { title: '待闭环投诉', value: openComplaints, href: ADMIN_ROUTES.complaints, hint: '待处理 → 处理中 → 已解决' },
    { title: '消息模板', value: messageTemplates.length, href: ADMIN_ROUTES.messageTemplates, hint: '短信 / 微信订阅消息' },
    { title: '推广 Banner', value: promotionBanners.filter((b) => b.enabled).length, href: ADMIN_ROUTES.promotions, hint: '首页轮播 / 推荐位' },
    { title: '报表导出', value: 'CSV', href: ADMIN_ROUTES.reports, hint: '订单、服务商、投诉、营收、用户' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">工作台</h1>
        <p className="mt-1 text-sm text-zinc-400">
          平台运营方视图：以下为演示数据统计，报表 CSV 导出请在「报表导出」页操作。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} to={c.href}>
            <Card className="border-zinc-800 bg-zinc-900/80 hover:border-amber-500/40 transition-colors h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-400 tabular-nums">{c.value}</div>
                <p className="mt-2 text-xs text-zinc-500">{c.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
