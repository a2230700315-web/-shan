import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import type { MessageChannel, MessageTemplate } from '../types'
import { cn } from '@/lib/utils'

const emptyForm = (): Omit<MessageTemplate, 'id' | 'updatedAt'> => ({
  name: '',
  channel: 'wechat_subscribe',
  trigger: '',
  content: '',
  enabled: true,
})

export default function MessageTemplatesPage() {
  const { messageTemplates, saveMessageTemplate, setTemplateEnabled } = useAdminConsole()
  const [editing, setEditing] = useState<MessageTemplate | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const openEdit = (t: MessageTemplate) => {
    setEditing(t)
    setCreating(false)
    setForm({
      name: t.name,
      channel: t.channel,
      trigger: t.trigger,
      content: t.content,
      enabled: t.enabled,
    })
  }

  const openCreate = () => {
    setEditing(null)
    setCreating(true)
    setForm(emptyForm())
  }

  const submit = () => {
    if (!form.name.trim() || !form.trigger.trim() || !form.content.trim()) return
    if (editing) {
      saveMessageTemplate({ ...editing, ...form })
    } else {
      saveMessageTemplate({ ...form })
    }
    setEditing(null)
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">消息模板</h1>
          <p className="mt-1 text-sm text-zinc-400">
            短信与微信订阅消息模板管理，变量使用 {"{{}}"} 占位符格式。
          </p>
        </div>
        <Button type="button" className="bg-amber-600 hover:bg-amber-500 shrink-0" onClick={openCreate}>
          新增模板
        </Button>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-200 text-base">模板列表</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="pb-3 pr-4 font-medium">名称</th>
                <th className="pb-3 pr-4 font-medium">渠道</th>
                <th className="pb-3 pr-4 font-medium">触发节点</th>
                <th className="pb-3 pr-4 font-medium">启用</th>
                <th className="pb-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {messageTemplates.map((t) => (
                <tr key={t.id} className="border-b border-zinc-800/80">
                  <td className="py-3 pr-4 font-medium text-zinc-100">{t.name}</td>
                  <td className="py-3 pr-4">{t.channel === 'sms' ? '短信' : '微信订阅消息'}</td>
                  <td className="py-3 pr-4 text-zinc-400">{t.trigger}</td>
                  <td className="py-3 pr-4">{t.enabled ? '是' : '否'}</td>
                  <td className="py-3 text-right space-x-2 whitespace-nowrap">
                    <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => openEdit(t)}>
                      编辑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-zinc-600 h-8"
                      onClick={() => setTemplateEnabled(t.id, !t.enabled)}
                    >
                      {t.enabled ? '停用' : '启用'}
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
              <CardTitle className="text-base">{editing ? '编辑模板' : '新增模板'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500">名称</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">渠道</label>
                <select
                  value={form.channel}
                  onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as MessageChannel }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="wechat_subscribe">微信订阅消息</option>
                  <option value="sms">短信</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500">触发节点</label>
                <input
                  value={form.trigger}
                  onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">模板内容</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-mono"
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
