export const ADMIN_BASE = '/admin' as const

export const ADMIN_ROUTES = {
  home: ADMIN_BASE,
  login: `${ADMIN_BASE}/login`,
  dashboard: `${ADMIN_BASE}/dashboard`,
  providers: `${ADMIN_BASE}/providers`,
  providerDetail: (id: string) => `${ADMIN_BASE}/providers/${id}`,
  orders: `${ADMIN_BASE}/orders`,
  orderDetail: (id: string) => `${ADMIN_BASE}/orders/${id}`,
  complaints: `${ADMIN_BASE}/complaints`,
  reports: `${ADMIN_BASE}/reports`,
  messageTemplates: `${ADMIN_BASE}/message-templates`,
  promotions: `${ADMIN_BASE}/promotions`,
  users: `${ADMIN_BASE}/users`,
  system: `${ADMIN_BASE}/system`,
} as const
