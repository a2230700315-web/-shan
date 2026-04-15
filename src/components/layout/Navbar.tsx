import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Zap, User, Building2, ShieldCheck, Home } from 'lucide-react'

const roles = [
  { id: 'client', label: '客户', icon: User, path: '/client' },
  { id: 'provider', label: '服务商', icon: Building2, path: '/provider' },
  { id: 'admin', label: '管理员', icon: ShieldCheck, path: '/admin' },
] as const

type RoleId = typeof roles[number]['id']

export function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentRole = useMemo((): RoleId => {
    if (location.pathname.startsWith('/client')) return 'client'
    if (location.pathname.startsWith('/provider')) return 'provider'
    if (location.pathname.startsWith('/admin')) return 'admin'
    return 'client'
  }, [location.pathname])

  const currentRoleLabel = roles.find(r => r.id === currentRole)?.label || '客户'
  const CurrentRoleIcon = roles.find(r => r.id === currentRole)?.icon || User

  const navItems = useMemo(() => {
    if (currentRole === 'client') {
      return [
        { path: '/client', label: '首页' },
        { path: '/client/publish', label: '发布需求' },
        { path: '/client/orders', label: '订单中心' },
        { path: '/client/messages', label: '消息中心' },
        { path: '/client/me', label: '我的' },
      ]
    }
    if (currentRole === 'provider') {
      return [
        { path: '/provider/orders', label: '订单管理' },
        { path: '/provider/offline-orders', label: '线下业务' },
        { path: '/provider/resources', label: '资源调度' },
        { path: '/provider/employees', label: '人员管理' },
        { path: '/provider/finance', label: '财务结算' },
        { path: '/provider/showcase', label: '实力展示' },
      ]
    }
    if (currentRole === 'admin') {
      return [
        { path: '/admin', label: '控制台' },
        { path: '/admin/providers', label: '服务商管理' },
        { path: '/admin/orders', label: '全局订单' },
        { path: '/admin/complaints', label: '投诉工单' },
        { path: '/admin/reports', label: '数据报表' },
      ]
    }
    return []
  }, [currentRole])

  const quickPublishPath = '/client/publish'

  if (location.pathname === '/' || location.pathname === '') {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-yellow-gradient rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black blue-gradient-text">闪吊</span>
                <span className={`text-[10px] transition-colors ${scrolled ? 'text-gray-400' : 'text-gray-500'}`}>
                  无人机吊运平台
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link to="/">
                <Button
                  size="sm"
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-blue"
                >
                  <Home className="w-4 h-4 mr-1" />
                  选择角色
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return !location.pathname.startsWith('/admin') ? (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={currentRole === 'admin' ? '/admin' : '/'} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-yellow-gradient rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black blue-gradient-text">闪吊</span>
              <span className={`text-[10px] transition-colors ${scrolled ? 'text-gray-400' : 'text-gray-500'}`}>
                无人机吊运平台
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                    ? 'bg-blue-50 text-blue-600'
                    : scrolled
                    ? 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled
                  ? 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  : 'bg-white/50 hover:bg-white/80 text-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              切换角色
            </Link>

            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              scrolled
                ? 'bg-gray-50 text-gray-700'
                : 'bg-white/50 text-gray-700'
            }`}>
              <CurrentRoleIcon className="w-4 h-4 text-blue-500" />
              {currentRoleLabel}
            </div>

            {currentRole === 'client' && (
              <Link to={quickPublishPath}>
                <Button
                  size="sm"
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-blue"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  快速发布
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  ) : null
}
