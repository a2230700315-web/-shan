import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminConsole } from '../context/AdminConsoleContext'
import type { ComplaintStatus } from '../types'
import { cn } from '@/lib/utils'

export default function ComplaintsPage() {
  const { complaints, advanceComplaint } = useAdminConsole()
  const [filter, setFilter] = useState<ComplaintStatus | 'all'>('all')
  const [activeId, setActiveId] = useState<string | null>(complaints[0]?.id ?? null)
  const [resultText, setResultText] = useState('')
  const [suggestionText, setSuggestionText] = useState('')

  const rows = useMemo(() => {
    if (filter === 'all') return complaints
    return complaints.filter((c) => c.status === filter)
  }, [complaints, filter])

  const active = complaints.find((c) => c.id === activeId) ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">投诉工单</h1>
        <p className="mt-1 text-sm text-zinc-400">
          待处理 → 处理中 → 已解决；平台记录处理结果并可向服务商下发整改建议，用户端可查看处理结果（演示）。
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'processing', 'resolved'] as const).map((k) => (
          <Button
            key={k}
            type="button"
            size="sm"
            variant={filter === k ? 'default' : 'outline'}
            className={cn(filter === k ? 'bg-amber-600 hover:bg-amber-500' : 'border-zinc-600 text-zinc-300')}
            onClick={() => setFilter(k)}
          >
            {k === 'all' ? '全部' : k === 'pending' ? '待处理' : k === 'processing' ? '处理中' : '已解决'}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-zinc-200 text-base">工单列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
            {rows.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveId(c.id)
                  setResultText(c.platformResult ?? '')
                  setSuggestionText(c.rectificationSuggestion ?? '')
                }}
                className={cn(
                  'w-full text-left rounded-lg border px-3 py-2.5 transition-colors',
                  activeId === c.id
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'
                )}
              >
                <div className="text-sm text-zinc-100 font-medium">{c.reason}</div>
                <div className="text-xs text-zinc-500 mt-1 font-mono">
                  {c.orderNo} · {c.userName}
                </div>
                <div className="text-[11px] text-zinc-600 mt-1">{c.status}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-zinc-200 text-base">处理与闭环</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!active && <p className="text-sm text-zinc-500">请选择左侧工单。</p>}
            {active && (
              <>
                <div className="text-sm text-zinc-300 space-y-1">
                  <p>
                    <span className="text-zinc-500">关联订单：</span>
                    <span className="font-mono text-amber-200/90">{active.orderNo}</span>
                  </p>
                  <p className="text-zinc-400">{active.detail}</p>
                </div>
                {active.status === 'pending' && (
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-500"
                    onClick={() => advanceComplaint(active.id, 'processing', { suggestion: suggestionText.trim() || undefined })}
                  >
                    进入处理中
                  </Button>
                )}
                <div>
                  <label className="text-xs text-zinc-500">整改建议（可选，同步服务商端/管理留痕）</label>
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
                  />
                </div>
                {active.status === 'processing' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-zinc-600 w-full sm:w-auto"
                      onClick={() =>
                        advanceComplaint(active.id, 'processing', {
                          suggestion: suggestionText.trim() || undefined,
                        })
                      }
                    >
                      保存整改建议
                    </Button>
                    <div>
                      <label className="text-xs text-zinc-500">处理结果（办结必填）</label>
                      <textarea
                        value={resultText}
                        onChange={(e) => setResultText(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
                        placeholder="向用户反馈的处理结论"
                      />
                    </div>
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-500"
                      disabled={!resultText.trim()}
                      onClick={() => {
                        advanceComplaint(active.id, 'resolved', {
                          result: resultText.trim(),
                          suggestion: suggestionText.trim() || undefined,
                        })
                      }}
                    >
                      办结（已解决）
                    </Button>
                  </>
                )}
                {active.status === 'resolved' && (
                  <div className="text-sm text-zinc-400 space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p>
                      <span className="text-zinc-500">处理结果：</span>
                      {active.platformResult}
                    </p>
                    {active.rectificationSuggestion && (
                      <p>
                        <span className="text-zinc-500">整改建议：</span>
                        {active.rectificationSuggestion}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
