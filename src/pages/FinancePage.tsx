import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, CheckCircle, Archive, Clock, ArrowRight } from 'lucide-react'

export default function FinancePage() {
  const { settlements, updateSettlement, showToast } = useApp()

  const unsettled = settlements.filter(s => s.status === 'unsettled')
  const settled = settlements.filter(s => s.status === 'settled')
  const archived = settlements.filter(s => s.status === 'archived')

  const totalUnsettled = unsettled.reduce((sum, s) => sum + s.amount, 0)
  const totalSettled = settled.reduce((sum, s) => sum + s.amount, 0)
  const totalArchived = archived.reduce((sum, s) => sum + s.amount, 0)

  const handleSettle = (orderId: string) => {
    updateSettlement(orderId, {
      status: 'settled',
      settledAt: new Date().toLocaleString('zh-CN'),
    })
    showToast('结算完成')
  }

  const handleArchive = (orderId: string) => {
    updateSettlement(orderId, { status: 'archived' })
    showToast('已归档')
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-accent" />
            财务结算中心
          </h1>
          <p className="text-muted-foreground">订单结算审核与账务记录</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground">待结算</span>
              </div>
              <div className="text-3xl font-black">{formatCurrency(totalUnsettled)}</div>
              <div className="text-xs text-muted-foreground mt-1">{unsettled.length} 笔订单</div>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">已结算</span>
              </div>
              <div className="text-3xl font-black">{formatCurrency(totalSettled)}</div>
              <div className="text-xs text-muted-foreground mt-1">{settled.length} 笔订单</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Archive className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">已归档</span>
              </div>
              <div className="text-3xl font-black">{formatCurrency(totalArchived)}</div>
              <div className="text-xs text-muted-foreground mt-1">{archived.length} 笔订单</div>
            </CardContent>
          </Card>
        </div>

        {/* Unsettled */}
        {unsettled.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              待结算订单
            </h2>
            <div className="space-y-3">
              {unsettled.map(s => (
                <Card key={s.orderId} className="border-warning/10">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="font-bold text-sm">{s.orderId}</div>
                        <div className="text-xs text-muted-foreground">{s.clientName}</div>
                      </div>
                      <div className="text-xl font-black text-gradient">{formatCurrency(s.amount)}</div>
                    </div>
                    <Button variant="premium" size="sm" onClick={() => handleSettle(s.orderId)}>
                      确认结算 <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Settled */}
        {settled.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              已结算订单
            </h2>
            <div className="space-y-3">
              {settled.map(s => (
                <Card key={s.orderId}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="font-bold text-sm">{s.orderId}</div>
                        <div className="text-xs text-muted-foreground">{s.clientName}</div>
                      </div>
                      <div className="font-bold">{formatCurrency(s.amount)}</div>
                      <div className="text-xs text-muted-foreground">结算于 {s.settledAt}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(s.orderId)}>
                      <Archive className="w-4 h-4 mr-1" />归档
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5 text-muted-foreground" />
              已归档
            </h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-muted-foreground">订单号</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">客户</th>
                      <th className="text-right p-4 font-semibold text-muted-foreground">金额</th>
                      <th className="text-right p-4 font-semibold text-muted-foreground">结算时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archived.map(s => (
                      <tr key={s.orderId} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4 font-mono text-xs">{s.orderId}</td>
                        <td className="p-4">{s.clientName}</td>
                        <td className="p-4 text-right font-semibold">{formatCurrency(s.amount)}</td>
                        <td className="p-4 text-right text-muted-foreground text-xs">{s.settledAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
