import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminConsoleProvider, useAdminConsole } from './context/AdminConsoleContext'
import { AdminLayout } from './components/AdminLayout'
import AdminLoginPage from './pages/LoginPage'
import AdminDashboardPage from './pages/DashboardPage'
import ProvidersPage from './pages/ProvidersPage'
import ProviderDetailPage from './pages/ProviderDetailPage'
import GlobalOrdersPage from './pages/GlobalOrdersPage'
import GlobalOrderDetailPage from './pages/GlobalOrderDetailPage'
import ComplaintsPage from './pages/ComplaintsPage'
import ReportsPage from './pages/ReportsPage'
import MessageTemplatesPage from './pages/MessageTemplatesPage'
import PromotionsPage from './pages/PromotionsPage'
import UsersPage from './pages/UsersPage'
import SystemPage from './pages/SystemPage'

function ProtectedShell() {
  const { session } = useAdminConsole()
  if (!session) {
    return <Navigate to="/admin/login" replace />
  }
  return <AdminLayout />
}

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminLoginPage />} />
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<ProtectedShell />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="providers/:id" element={<ProviderDetailPage />} />
        <Route path="orders" element={<GlobalOrdersPage />} />
        <Route path="orders/:id" element={<GlobalOrderDetailPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="message-templates" element={<MessageTemplatesPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="system" element={<SystemPage />} />
      </Route>
      <Route path="*" element={<AdminLoginPage />} />
    </Routes>
  )
}

/** 管理后台独立路由树：自带 AdminConsoleProvider，与 AppProvider/服务商端权限隔离 */
export function AdminApp() {
  return (
    <AdminConsoleProvider>
      <AdminRoutes />
    </AdminConsoleProvider>
  )
}
