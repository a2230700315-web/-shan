import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { User, Phone, MapPinned, MessageSquareWarning } from 'lucide-react'
import { useUserWeb } from '../state/UserWebStore'

function fmt(ms: number) {
  return new Date(ms).toLocaleString('zh-CN')
}

export default function MePage() {
  const { complaints } = useUserWeb()

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">我的</h1>
            <p className="text-muted-foreground">个人信息、地址簿、投诉记录等。</p>
          </div>
          <Link to="/client/messages">
            <Button variant="outline">进入消息中心</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-base">个人信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">昵称：</span>
                  <span className="font-semibold">访客用户</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">手机号：</span>
                  <span className="font-semibold">未绑定</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  说明：当前为前端演示形态，后续可接入手机号注册/登录与企业认证。
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPinned className="w-4 h-4 text-accent" />
                  地址簿
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                地址簿（常用地址收藏）将在后续版本接入。当前可在发布需求页直接输入地址。
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4 text-destructive" />
                  投诉记录
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {complaints.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">暂无投诉记录</div>
                ) : (
                  <div className="divide-y">
                    {complaints.map(c => (
                      <div key={c.id} className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold">{c.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {c.status === 'pending' ? '待处理' : c.status === 'processing' ? '处理中' : '已解决'}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{fmt(c.createdAt)}</div>
                        <div className="text-sm mt-2 break-words">{c.content}</div>
                        <div className="mt-2 text-sm">
                          <Link className="text-accent font-semibold" to={`/client/orders/${encodeURIComponent(c.orderId)}`}>查看关联订单</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

