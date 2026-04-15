export type ProviderRole = 'admin' | 'service' | 'ground' | 'pilot' | 'finance'

export type OrderNodeKey =
  | 'demand_submitted'
  | 'provider_accept'
  | 'provider_quote'
  | 'user_confirm_quote'
  | 'resource_assign'
  | 'ground_depart'
  | 'pilot_start'
  | 'pilot_finish'
  | 'finance_invoice'
  | 'user_rate'

export type OrderLifecycleStatus = 'in_progress' | 'completed' | 'closed'

export type CloseReason =
  | 'provider_rejected'
  | 'accept_timeout'
  | 'quote_confirm_timeout'
  | 'bargain_timeout'
  | 'manual_close'

export interface GeoPoint {
  label: string
  lat: number
  lng: number
  // 行政区划信息：用于“区域匹配”展示（服务商端只读）
  adcode?: string
}

export interface Cargo {
  name: string
  totalWeightKg: number
  maxSingleWeightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface TimelineItem {
  node: OrderNodeKey
  at: number // epoch ms
  operatorRole?: ProviderRole | 'user'
  operatorName?: string
  note?: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  kind: 'photo' | 'video' | 'file'
  name: string
  url: string
}

export interface QuoteRound {
  round: number // 1..3
  providerPriceYuan: number
  providerNote?: string
  providerAt: number
  userDecision: 'pending' | 'accepted' | 'rejected'
  userAt?: number
  userExpectedPriceYuan?: number
  userNote?: string
}

export interface Assignment {
  pilotEmployeeId: string
  groundEmployeeId: string
  droneId?: string
  vehicleId?: string
}

export interface WorkResult {
  actualWeightKg: number
  actualVolumeCm: { length: number; width: number; height: number }
  actualAmountYuan: number
  evidence: Attachment[]
}

export interface InvoiceInfo {
  invoiceNo: string
  invoicedAt: number
}

export interface ReceiptInfo {
  receivedAt: number
  receivedAmountYuan: number
  method: 'cash' | 'bank_transfer' | 'other'
  note?: string
  status?: 'received' | 'pending'
}

export interface ProviderOrder {
  id: string
  createdAt: number
  expectedAt: number

  clientName: string
  clientPhone: string

  pickupPoint: GeoPoint
  deliveryPoint: GeoPoint
  horizontalDistanceM: number
  verticalDistanceM: number

  cargo: Cargo
  remark?: string

  lifecycleStatus: OrderLifecycleStatus
  currentNode: OrderNodeKey

  // 议价/报价
  quotes: QuoteRound[]

  // 资源分配
  assignment?: Assignment

  // 作业结果
  workResult?: WorkResult

  // 发票与收款关联
  invoice?: InvoiceInfo
  receipt?: ReceiptInfo

  timeline: TimelineItem[]

  closedAt?: number
  closeReason?: CloseReason
  closeNote?: string
}

export interface ProviderEmployee {
  id: string
  name: string
  phone: string
  role: ProviderRole
  joinAt: number
  // 飞手执照编号等扩展字段（只在 UI 展示/编辑时用到）
  licenseNo?: string
}

export interface NotificationItem {
  id: string
  toRole?: ProviderRole // 站内信：面向角色；也可扩展到具体 employeeId
  toEmployeeId?: string
  createdAt: number
  readAt?: number
  title: string
  content: string
  relatedOrderId?: string
  level: 'info' | 'warning'
}

