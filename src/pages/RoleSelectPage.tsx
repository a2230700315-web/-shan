import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, Building2, ShieldCheck } from 'lucide-react'

const roles = [
  {
    id: 'client',
    label: '客户',
    description: '发布吊运需求，跟踪订单进度，评价服务',
    icon: User,
    path: '/client',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-500',
  },
  {
    id: 'provider',
    label: '服务商',
    description: '接单报价，分配资源，管理财务，执行吊运',
    icon: Building2,
    path: '/provider',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-500',
  },
  {
    id: 'admin',
    label: '管理员',
    description: '全局订单管理，服务商审核，平台运营',
    icon: ShieldCheck,
    path: '/admin',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-500',
  },
]

export default function RoleSelectPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      <div className="relative z-10 text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
          <span className="text-sm font-medium">闪吊无人机吊运平台</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          选择<span className="text-gradient">角色入口</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          根据您的身份选择对应的入口，体验完整的业务流程
        </p>
      </div>

      <div className="relative z-10 grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <Card
              key={role.id}
              className={`${role.bgColor} ${role.borderColor} border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group`}
              onClick={() => navigate(role.path)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${role.textColor}`}>{role.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
                <Button
                  variant="outline"
                  className={`mt-4 w-full ${role.borderColor} ${role.textColor} hover:${role.bgColor}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(role.path)
                  }}
                >
                  进入
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="relative z-10 mt-12 text-center">
        <p className="text-xs text-muted-foreground">
          不同角色拥有不同的功能权限，请根据实际身份选择
        </p>
      </div>
    </div>
  )
}
