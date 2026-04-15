export type UserOrderLifecycleStatus = 'open' | 'closed' | 'completed'

export type UserOrderNodeKey =
  | 'submit_demand'
  | 'provider_accept'
  | 'provider_quote'
  | 'user_confirm_quote'
  | 'resource_assign'
  | 'depart_to_site'
  | 'start_work'
  | 'finish_work'
  | 'issue_invoice'
  | 'user_review'

export interface UserOrderNode {
  key: UserOrderNodeKey
  label: string
  operatorLabel: string
  time: number | null // unix ms
  remark?: string | null
}

export interface QuoteRound {
  round: number // 1..3
  providerPriceCny: number
  providerNote?: string | null
  userDecision?: 'confirm' | 'reject' | null
  userExpectedPriceCny?: number | null
  userRejectReason?: string | null
  createdAt: number
  decidedAt?: number | null
}

export interface UserReview {
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string | null
  createdAt: number
}

export type ComplaintStatus = 'pending' | 'processing' | 'resolved'

export interface Complaint {
  id: string
  orderId: string
  reason: 'service_attitude' | 'cargo_damage' | 'overcharge' | 'other'
  content: string
  evidenceImageUrls: string[]
  status: ComplaintStatus
  createdAt: number
  updatedAt: number
  result?: string | null
}

export type MessageChannel = 'inbox' | 'sms' | 'wechat'

export interface UserMessage {
  id: string
  orderId?: string | null
  title: string
  content: string
  channel: MessageChannel
  createdAt: number
  readAt?: number | null
}

export interface UserOrderDemandForm {
  pickupAddress: string
  deliveryAddress: string
  pickupLat: number | null
  pickupLng: number | null
  deliveryLat: number | null
  deliveryLng: number | null
  horizontalDistanceKm: number
  verticalDistanceMeters: number
  cargoName: string
  totalWeightKg: number
  maxSingleWeightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  expectedDate: string
  clientName: string
  clientPhone: string
  remark: string | null
}

export interface UserOrder {
  id: string
  lifecycleStatus: UserOrderLifecycleStatus
  closeReason?: string | null
  createdAt: number
  updatedAt: number

  demand: UserOrderDemandForm

  currentNode: UserOrderNodeKey
  nodes: UserOrderNode[]

  quoteRounds: QuoteRound[]
  awaitingUserQuoteDecision: boolean
  quoteDecisionDeadlineAt?: number | null
  acceptDeadlineAt: number // submit+2h

  review?: UserReview | null
}

