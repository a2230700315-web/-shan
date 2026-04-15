import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ADMIN_ROUTES } from '../routes'

export default function ProviderDetailPage() {
  const { id } = useParams()
  const {
    providers,
    updateProviderRegions,
    updateProviderBasics,
    approveProvider,
    rejectProvider,
    setProviderDisabled,
  } = useAdminConsole()
  const p = useMemo(() => providers.find((x) => x.id === id), [providers, id])
  const [regionsDraft, setRegionsDraft] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  useEffect(() => {
    const cur = providers.find((x) => x.id === id)
    if (cur) {
      setRegionsDraft(cur.regions.join('\n'))
      setCompanyName(cur.companyName)
      setContactName(cur.contactName)
      setContactPhone(cur.contactPhone)
    }
  }, [providers, id])

  if (!p) {
    return (
      <div className="text-zinc-400">
        未找到服务商。{' '}
        <Link to={ADMIN_ROUTES.providers} className="text-amber-400 hover:underline">
          返回列表
        </Link>
      </div>
    )
  }

  const saveRegions = () => {
    const lines = regionsDraft
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    updateProviderRegions(p.id, lines)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to={ADMIN_ROUTES.providers} className="text-sm text-zinc-500 hover:text-amber-400">
          ← 返回列表
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{p.companyName}</h1>
        <p className="text-sm text-zinc-500 mt-1">统一社会信用代码：{p.creditCode}</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <label className="text-xs text-zinc-500">公司名称</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500">联系人</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">联系电话</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-amber-600 hover:bg-amber-500"
            disabled={!companyName.trim() || !contactName.trim() || !contactPhone.trim()}
            onClick={() =>
              updateProviderBasics(p.id, {
                companyName: companyName.trim(),
                contactName: contactName.trim(),
                contactPhone: contactPhone.trim(),
              })
            }
          >
            保存基本信息
          </Button>
          <p className="text-zinc-500 text-xs">提交时间：{p.submittedAt}</p>
          {p.rejectedReason && <p className="text-red-400 text-xs">驳回原因：{p.rejectedReason}</p>}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">经营数据（演示）</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-zinc-500 text-xs">订单量</div>
            <div className="text-lg font-semibold text-zinc-100 tabular-nums">{formatNumber(p.ordersCount)}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs">营收（线下结算汇总）</div>
            <div className="text-lg font-semibold text-zinc-100">{formatCurrency(p.revenue)}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs">响应速度</div>
            <div className="text-lg font-semibold text-zinc-100">
              {p.responseMinutes > 0 ? `约 ${p.responseMinutes} 分钟` : '—'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">负责区域（省/市/区县，每行一条）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={regionsDraft}
            onChange={(e) => setRegionsDraft(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
          />
          <Button type="button" size="sm" className="bg-amber-600 hover:bg-amber-500" onClick={saveRegions}>
            保存区域配置
          </Button>
          <p className="text-[11px] text-zinc-500">
            实际生产环境由运营在后台配置覆盖区域；此处为前端演示状态写入（内存）。
          </p>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">审核与状态</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {p.auditStatus === 'pending' && (
            <>
              <Button type="button" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => approveProvider(p.id)}>
                审核通过
              </Button>
              <div className="flex gap-2 items-center flex-1 min-w-[200px]">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="驳回原因"
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!rejectReason.trim()}
                  onClick={() => rejectProvider(p.id, rejectReason.trim())}
                >
                  驳回
                </Button>
              </div>
            </>
          )}
          {p.auditStatus === 'approved' && (
            <Button
              type="button"
              variant="outline"
              className="border-zinc-600"
              onClick={() => setProviderDisabled(p.id, !p.disabled)}
            >
              {p.disabled ? '启用服务商' : '禁用服务商'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
