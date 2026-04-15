export type MiniProgramPortal = 'user' | 'provider'

export type MiniProgramRole =
  | 'user'
  | 'provider_admin'
  | 'customer_service'
  | 'ground_crew'
  | 'pilot'
  | 'finance'

export type OrderNodeCode =
  | 'SUBMIT_DEMAND'
  | 'PROVIDER_ACCEPT'
  | 'PROVIDER_QUOTE'
  | 'USER_CONFIRM_QUOTE'
  | 'RESOURCE_ASSIGN'
  | 'DEPART_TO_SITE'
  | 'START_LIFTING'
  | 'FINISH_LIFTING'
  | 'ISSUE_INVOICE'
  | 'USER_REVIEW'

export interface MiniProgramPageMeta {
  id: string
  name: string
  path: string
  portal: MiniProgramPortal
  description: string
  requiresAuth: boolean
  allowedRoles: MiniProgramRole[]
}

export interface RolePermissionMatrix {
  role: MiniProgramRole
  visibleMenus: string[]
  allowedNodeActions: OrderNodeCode[]
}

export interface OrderNodeDefinition {
  code: OrderNodeCode
  label: string
  operatorRoles: MiniProgramRole[]
  userVisible: boolean
  providerVisible: boolean
  timeoutHours?: number
  autoCloseOnTimeout?: boolean
}

export type NegotiationDecision = 'confirm' | 'reject'

export interface QuoteRound {
  round: 1 | 2 | 3
  providerPrice: number
  providerRemark?: string
  userDecision?: NegotiationDecision
  userExpectedPrice?: number
  userRemark?: string
  submittedAt: string
}

export interface MessageTemplate {
  key: string
  triggerNode: OrderNodeCode | 'COMPLAINT_RESOLVED' | 'ORDER_CLOSED'
  recipient: 'user' | 'provider' | 'pilot' | 'ground_crew' | 'finance' | 'admin'
  channels: Array<'wechat_subscribe' | 'sms' | 'in_app'>
  content: string
}

export interface MiniOrderTimelineItem {
  node: OrderNodeCode
  done: boolean
  operator?: string
  operatedAt?: string
  remark?: string
}

export interface MiniOrderRecord {
  orderId: string
  currentNode: OrderNodeCode
  status: 'in_progress' | 'completed' | 'closed'
  negotiationRounds: QuoteRound[]
  timeline: MiniOrderTimelineItem[]
  assignedPilotId?: string
  assignedGroundCrewId?: string
  invoiceNo?: string
  invoiceIssuedAt?: string
  paymentMethod?: 'cash' | 'bank_transfer' | 'other'
  paymentAmount?: number
  paymentReceivedAt?: string
}
