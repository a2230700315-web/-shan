import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check, Dot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUserWeb } from '../state/UserWebStore'

function fmt(ms: number) {
  return new Date(ms).toLocaleString('zh-CN')
}

export default function MessagesPage() {
  const { messages, markMessageRead, markAllMessagesRead } = useUserWeb()
  const unread = messages.filter(m => !m.readAt).length

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-accent" />
              消息中心
            </h1>
            <p className="text-muted-foreground">订单关键节点会产生站内信通知（后续可扩展微信订阅/短信）。</p>
          </div>
          <Button variant="outline" onClick={markAllMessagesRead} disabled={unread === 0}>
            <Check className="w-4 h-4 mr-2" />
            全部标为已读（{unread}）
          </Button>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">站内信</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {messages.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">暂无消息</div>
            ) : (
              <div className="divide-y">
                {messages.map(m => (
                  <div key={m.id} className="p-5 flex items-start gap-3 hover:bg-secondary/30 transition-colors">
                    <div className="mt-1">
                      {!m.readAt ? <Dot className="w-6 h-6 text-accent" /> : <div className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold truncate">{m.title}</div>
                        <div className="text-xs text-muted-foreground shrink-0">{fmt(m.createdAt)}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 break-words">{m.content}</div>
                      {m.orderId && (
                        <div className="mt-2">
                          <Link className="text-sm font-semibold text-accent" to={`/client/orders/${encodeURIComponent(m.orderId)}`}>
                            查看订单
                          </Link>
                        </div>
                      )}
                    </div>
                    {!m.readAt && (
                      <Button variant="outline" size="sm" onClick={() => markMessageRead(m.id)}>
                        标为已读
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

