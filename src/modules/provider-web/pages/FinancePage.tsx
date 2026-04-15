import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Download } from 'lucide-react'
import { ProviderWebProvider, useProviderWeb } from '../store'
import { canViewOrder } from '../domain/workflow'
import { toCsv } from '../domain/performance'

function money(n: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n)
}

function ts(t: number) {
  return new Date(t).toLocaleString('zh-CN')
}

function FinanceInner() {
  const { orders, session, resetDemoData } = useProviderWeb()

  const rows = useMemo(() => {
    return orders
      .filter(o => canViewOrder(session.role, o, session.employeeId))
      .map(o => {
        const receivable = o.workResult?.actualAmountYuan ?? o.quotes[o.quotes.length - 1]?.providerPriceYuan ?? 0
        const invoiced = Boolean(o.invoice?.invoiceNo)
        const received = o.receipt?.status === 'received' || Boolean(o.receipt && o.receipt.receivedAmountYuan > 0)
        const outstanding = invoiced && !received ? receivable : 0
        return {
          orderId: o.id,
          clientName: o.clientName,
          receivableYuan: receivable,
          invoiceNo: o.invoice?.invoiceNo ?? '',
          invoicedAt: o.invoice ? ts(o.invoice.invoicedAt) : '',
          receivedAmountYuan: o.receipt?.receivedAmountYuan ?? '',
          receivedAt: o.receipt ? ts(o.receipt.receivedAt) : '',
          receiptMethod: o.receipt?.method ?? '',
          outstandingYuan: outstanding,
        }
      })
  }, [orders, session.employeeId, session.role])

  const totals = useMemo(() => {
    const receivable = rows.reduce((s, r) => s + (Number(r.receivableYuan) || 0), 0)
    const outstanding = rows.reduce((s, r) => s + (Number(r.outstandingYuan) || 0), 0)
    const received = orders
      .map(o => o.receipt?.receivedAmountYuan)
      .filter((x): x is number => typeof x === 'number' && x > 0)
      .reduce((a, b) => a + b, 0)
    return { receivable, outstanding, received }
  }, [orders, rows])

  const exportCsv = () => {
    const csv = toCsv(rows.map(r => ({
      订单号: r.orderId,
      客户: r.clientName,
      应收: String(r.receivableYuan),
      发票号: r.invoiceNo,
      开票时间: r.invoicedAt,
      实收: String(r.receivedAmountYuan ?? ''),
      收款时间: r.receivedAt,
      收款方式: r.receiptMethod,
      待收款: String(r.outstandingYuan ?? ''),
    })))
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `provider-finance-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-accent" />
              财务管理（统计）
            </h1>
            <p className="text-muted-foreground">收入明细、发票与收款关联、待收款汇总（平台不托管交易资金）</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDemoData}>重置演示数据</Button>
            <Button variant="premium" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" />
              导出 CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">应收参考（完工/报价）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{money(totals.receivable)}</div>
              <div className="text-xs text-muted-foreground mt-1">用于服务商内部统计，不代表平台抽成</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">已开票未收款</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{money(totals.outstanding)}</div>
              <div className="text-xs text-muted-foreground mt-1">待收款总额（已开票但未标记收款）</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">已标记收款</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{money(totals.received)}</div>
              <div className="text-xs text-muted-foreground mt-1">来自财务节点登记的收款记录</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">收入明细</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-muted-foreground">订单号</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">客户</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">应收</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">发票号</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">开票时间</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">实收</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">收款时间</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">待收款</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.orderId} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-mono text-xs">{r.orderId}</td>
                      <td className="p-4">{r.clientName}</td>
                      <td className="p-4 text-right font-semibold">{money(Number(r.receivableYuan) || 0)}</td>
                      <td className="p-4">{r.invoiceNo || '—'}</td>
                      <td className="p-4 text-xs text-muted-foreground">{r.invoicedAt || '—'}</td>
                      <td className="p-4 text-right">{r.receivedAmountYuan === '' ? '—' : money(Number(r.receivedAmountYuan))}</td>
                      <td className="p-4 text-xs text-muted-foreground">{r.receivedAt || '—'}</td>
                      <td className="p-4 text-right">{Number(r.outstandingYuan) > 0 ? money(Number(r.outstandingYuan)) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function FinancePage() {
  return (
    <ProviderWebProvider>
      <FinanceInner />
    </ProviderWebProvider>
  )
}
