/** 管理后台运营账号角色（与服务商端 RBAC 完全隔离） */
export type PlatformOpsRole = 'super_admin' | 'ops_admin'

export interface PlatformSession {
  username: string
  displayName: string
  role: PlatformOpsRole
  loggedInAt: string
}

export type ProviderAuditStatus = 'pending' | 'approved' | 'rejected'

export interface ServiceProviderRecord {
  id: string
  companyName: string
  creditCode: string
  contactName: string
  contactPhone: string
  auditStatus: ProviderAuditStatus
  disabled: boolean
  rejectedReason?: string
  regions: string[]
  submittedAt: string
  ordersCount: number
  revenue: number
  rating: number
  responseMinutes: number
}

export type AdminOrderStatus = 'in_progress' | 'completed' | 'closed' | 'exception'

export interface AdminOrderTimelineEntry {
  node: string
  operator: string
  at: string
  note?: string
}

export interface AdminGlobalOrder {
  id: string
  orderNo: string
  providerId: string
  providerName: string
  clientName: string
  clientPhone: string
  currentNode: string
  status: AdminOrderStatus
  exceptionNote?: string
  createdAt: string
  timeline: AdminOrderTimelineEntry[]
}

export type ComplaintStatus = 'pending' | 'processing' | 'resolved'

export interface ComplaintTicket {
  id: string
  orderId: string
  orderNo: string
  userName: string
  reason: string
  detail: string
  imageUrls: string[]
  status: ComplaintStatus
  createdAt: string
  updatedAt: string
  platformResult?: string
  rectificationSuggestion?: string
}

export type MessageChannel = 'sms' | 'wechat_subscribe'

export interface MessageTemplate {
  id: string
  name: string
  channel: MessageChannel
  trigger: string
  content: string
  enabled: boolean
  updatedAt: string
}

export interface PlatformUserRecord {
  id: string
  name: string
  phone: string
  verified: boolean
  blacklisted: boolean
  registeredAt: string
}

export interface AuditLogEntry {
  id: string
  at: string
  operator: string
  action: string
  detail: string
}

/** 首页 Banner / 推荐位（运营配置，演示数据） */
export interface PromotionBanner {
  id: string
  title: string
  imageUrl: string
  linkUrl: string
  sort: number
  enabled: boolean
}
