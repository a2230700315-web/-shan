import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import { downloadCsvFile } from '../lib/csvExport'
import { formatNumber } from '@/lib/utils'

const FEE_PER_PROVIDER_YEAR = 5000

export default function ReportsPage() {
  const { globalOrders, providers, complaints, platformUsers } = useAdminConsole()

  const approvedCount = providers.filter((p) => p.auditStatus === 'approved' && !p.disabled).length
  const platformFeeDemo = approvedCount * FEE_PER_PROVIDER_YEAR

  const exportOrders = () => {
    const rows: string[][] = [
      ['订单号', '服务商', '客户', '客户手机', '状态', '当前节点', '创建时间', '异常备注'],
      ...globalOrders.map((o) => [
        o.orderNo,
        o.providerName,
        o.clientName,
        o.clientPhone,
        o.status,
        o.currentNode,
        o.createdAt,
        o.exceptionNote ?? '',
      ]),
    ]
    downloadCsvFile('全平台订单报表.csv', rows)
  }

  const exportProviders = () => {
    const rows: string[][] = [
      ['公司', '信用代码', '审核状态', '禁用', '区域', '订单量', '评分', '响应(分钟)', '营收(演示)'],
      ...providers.map((p) => [
        p.companyName,
        p.creditCode,
        p.auditStatus,
        p.disabled ? '是' : '否',
        p.regions.join('；'),
        String(p.ordersCount),
        p.rating > 0 ? String(p.rating) : '',
        String(p.responseMinutes),
        String(p.revenue),
      ]),
    ]
    downloadCsvFile('服务商经营报表.csv', rows)
  }

  const exportComplaints = () => {
    const rows: string[][] = [
      ['工单ID', '订单号', '用户', '原因', '状态', '创建时间', '更新时间', '处理结果', '整改建议'],
      ...complaints.map((c) => [
        c.id,
        c.orderNo,
        c.userName,
        c.reason,
        c.status,
        c.createdAt,
        c.updatedAt,
        c.platformResult ?? '',
        c.rectificationSuggestion ?? '',
      ]),
    ]
    downloadCsvFile('投诉工单报表.csv', rows)
  }

  const exportPlatformRevenue = () => {
    const rows: string[][] = [
      ['指标', '数值', '说明'],
      ['有效服务商数（已审核且未禁用）', String(approvedCount), '用于演示年费测算'],
      ['软件服务费单价(元/年)', String(FEE_PER_PROVIDER_YEAR), '平台定价，不涉及订单抽成'],
      ['年费应收合计(演示)', String(platformFeeDemo), '线下对公 / 专用缴费接口'],
    ]
    downloadCsvFile('平台服务费收入报表.csv', rows)
  }

  const exportUsers = () => {
    const rows: string[][] = [
      ['用户ID', '昵称', '手机', '实名认证', '黑名单', '注册时间'],
      ...platformUsers.map((u) => [
        u.id,
        u.name,
        u.phone,
        u.verified ? '是' : '否',
        u.blacklisted ? '是' : '否',
        u.registeredAt,
      ]),
    ]
    downloadCsvFile('平台用户报表.csv', rows)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">报表导出</h1>
        <p className="mt-1 text-sm text-zinc-400">
          自定义报表导出入口；以下为 UTF-8 CSV（含 BOM），可用 Excel 打开。
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">平台服务费（演示汇总）</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-300 space-y-1">
          <p>
            有效服务商：<span className="text-amber-400 font-semibold tabular-nums">{approvedCount}</span> 家
          </p>
          <p>
            年费应收（演示）：<span className="text-amber-400 font-semibold tabular-nums">{formatNumber(platformFeeDemo)}</span> 元
          </p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-zinc-200 text-base">注册用户</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full bg-amber-600 hover:bg-amber-500" onClick={exportUsers}>
              导出用户 CSV
            </Button>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-zinc-200 text-base">全平台订单</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full bg-amber-600 hover:bg-amber-500" onClick={exportOrders}>
              导出订单 CSV
            </Button>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-zinc-200 text-base">服务商维度</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full bg-amber-600 hover:bg-amber-500" onClick={exportProviders}>
              导出服务商 CSV
            </Button>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-zinc-200 text-base">投诉工单</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full bg-amber-600 hover:bg-amber-500" onClick={exportComplaints}>
              导出投诉 CSV
            </Button>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-zinc-200 text-base">平台营收</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full bg-amber-600 hover:bg-amber-500" onClick={exportPlatformRevenue}>
              导出营收 CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
