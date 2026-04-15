import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import type { PromotionBanner } from '../types'
import { cn } from '@/lib/utils'

const emptyBanner = (): Omit<PromotionBanner, 'id'> => ({
  title: '',
  imageUrl: '',
  linkUrl: '',
  sort: 100,
  enabled: true,
})

export default function PromotionsPage() {
  const { promotionBanners, savePromotionBanner, setPromotionBannerEnabled, removePromotionBanner } = useAdminConsole()
  const [editing, setEditing] = useState<PromotionBanner | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyBanner)

  const sorted = [...promotionBanners].sort((a, b) => a.sort - b.sort)

  const openEdit = (b: PromotionBanner) => {
    setEditing(b)
    setCreating(false)
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      sort: b.sort,
      enabled: b.enabled,
    })
  }

  const openCreate = () => {
    setEditing(null)
    setCreating(true)
    setForm(emptyBanner())
  }

  const submit = () => {
    if (!form.title.trim() || !form.imageUrl.trim()) return
    if (editing) {
      savePromotionBanner({ id: editing.id, ...form })
    } else {
      savePromotionBanner({ ...form })
    }
    setEditing(null)
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">推广管理</h1>
          <p className="mt-1 text-sm text-zinc-400">
            首页 Banner / 推荐位手动配置（演示数据写入内存；用户端首页需另行接入同一 API）。
          </p>
        </div>
        <Button type="button" className="bg-amber-600 hover:bg-amber-500 shrink-0" onClick={openCreate}>
          新增 Banner
        </Button>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">Banner 列表（按排序值升序）</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 pr-4 font-medium">排序</th>
                <th className="pb-3 pr-4 font-medium">标题</th>
                <th className="pb-3 pr-4 font-medium">链接</th>
                <th className="pb-3 pr-4 font-medium">启用</th>
                <th className="pb-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {sorted.map((b) => (
                <tr key={b.id} className="border-b border-zinc-800/80">
                  <td className="py-3 pr-4 tabular-nums">{b.sort}</td>
                  <td className="py-3 pr-4 font-medium text-zinc-100">{b.title}</td>
                  <td className="py-3 pr-4 max-w-[200px] truncate font-mono text-xs text-zinc-500">{b.linkUrl}</td>
                  <td className="py-3 pr-4">{b.enabled ? '是' : '否'}</td>
                  <td className="py-3 text-right space-x-2 whitespace-nowrap">
                    <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => openEdit(b)}>
                      编辑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-zinc-600 h-8"
                      onClick={() => setPromotionBannerEnabled(b.id, !b.enabled)}
                    >
                      {b.enabled ? '停用' : '启用'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={() => removePromotionBanner(b.id)}
                    >
                      删除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {(creating || editing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-lg border-zinc-700 bg-zinc-900 text-zinc-100">
            <CardHeader>
              <CardTitle className="text-base">{editing ? '编辑 Banner' : '新增 Banner'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500">标题</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">图片 URL</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">跳转链接</label>
                <input
                  value={form.linkUrl}
                  onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono"
                  placeholder="#/ 或 https://"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">排序（数字越小越靠前）</label>
                <input
                  type="number"
                  value={form.sort}
                  onChange={(e) => setForm((f) => ({ ...f, sort: Number(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <label className={cn('flex items-center gap-2 text-sm text-zinc-400')}>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                />
                启用
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-600"
                  onClick={() => {
                    setCreating(false)
                    setEditing(null)
                  }}
                >
                  取消
                </Button>
                <Button type="button" className="bg-amber-600 hover:bg-amber-500" onClick={submit}>
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
