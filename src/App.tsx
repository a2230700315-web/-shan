import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from '@/lib/store'
import { Navbar } from '@/components/layout/Navbar'
import { Toast } from '@/components/ui/toast'
import { MouseGlow, ClickRipple, ParticleBackground } from '@/components/ui/interactive'
import { UserHomePage, UserOrdersPage, UserOrderDetailPage, UserMessagesPage, UserMePage, UserWebProvider } from '@/modules/user-web'
import {
  ProviderOrdersPage,
  OfflineOrdersPage,
  ProviderResourcesPage,
  ProviderEmployeesPage,
  ProviderFinancePage,
  ProviderShowcasePage,
  ProviderWebProvider,
} from '@/modules/provider-web'
import { AdminApp } from '@/modules/admin-web'
import PublishPage from '@/pages/PublishPage'
import RoleSelectPage from '@/pages/RoleSelectPage'

function App() {
  return (
    <HashRouter>
      <AppProvider>
        <div className="min-h-screen bg-background text-foreground">
          <ParticleBackground />
          <MouseGlow />
          <ClickRipple />
          <Navbar />
          <Toast />
          <Routes>
            <Route path="/" element={<RoleSelectPage />} />

            <Route
              path="/client/*"
              element={
                <UserWebProvider>
                  <Routes>
                    <Route index element={<UserHomePage />} />
                    <Route path="publish" element={<PublishPage />} />
                    <Route path="orders" element={<UserOrdersPage />} />
                    <Route path="orders/:orderId" element={<UserOrderDetailPage />} />
                    <Route path="messages" element={<UserMessagesPage />} />
                    <Route path="me" element={<UserMePage />} />
                    <Route path="*" element={<Navigate to="orders" replace />} />
                  </Routes>
                </UserWebProvider>
              }
            />



            <Route
              path="/provider/*"
              element={
                <ProviderWebProvider>
                  <Routes>
                    <Route index element={<Navigate to="orders" replace />} />
                    <Route path="orders" element={<ProviderOrdersPage />} />
                    <Route path="offline-orders" element={<OfflineOrdersPage />} />
                    <Route path="resources" element={<ProviderResourcesPage />} />
                    <Route path="employees" element={<ProviderEmployeesPage />} />
                    <Route path="finance" element={<ProviderFinancePage />} />
                    <Route path="showcase" element={<ProviderShowcasePage />} />
                    <Route path="*" element={<Navigate to="orders" replace />} />
                  </Routes>
                </ProviderWebProvider>
              }
            />

            <Route path="/admin/*" element={<AdminApp />} />

            <Route path="/publish" element={<Navigate to="/client/publish" replace />} />
            <Route path="/u/*" element={<Navigate to="/client/orders" replace />} />
            <Route path="/orders" element={<Navigate to="/provider/orders" replace />} />
            <Route path="/resources" element={<Navigate to="/provider/resources" replace />} />
            <Route path="/employees" element={<Navigate to="/provider/employees" replace />} />
            <Route path="/finance" element={<Navigate to="/provider/finance" replace />} />
            <Route path="/showcase" element={<Navigate to="/provider/showcase" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppProvider>
    </HashRouter>
  )
}

export default App
