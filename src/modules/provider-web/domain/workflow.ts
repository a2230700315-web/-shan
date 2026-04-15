import type {
  ProviderOrder,
  ProviderRole,
  OrderNodeKey,
  QuoteRound,
  CloseReason,
  Attachment,
  Assignment,
  InvoiceInfo,
  ReceiptInfo,
  WorkResult,
} from './types'

export const ORDER_NODES: { key: OrderNodeKey; label: string }[] = [
  { key: 'demand_submitted', label: '提交需求' },
  { key: 'provider_accept', label: '服务商接单' },
  { key: 'provider_quote', label: '服务商报价' },
  { key: 'user_confirm_quote', label: '用户确认报价' },
  { key: 'resource_assign', label: '资源分配' },
  { key: 'ground_depart', label: '前往吊运地点' },
  { key: 'pilot_start', label: '开始吊运' },
  { key: 'pilot_finish', label: '吊运结束' },
  { key: 'finance_invoice', label: '开具发票/收款' },
  { key: 'user_rate', label: '评价服务' },
]

export function nodeLabel(node: OrderNodeKey): string {
  return ORDER_NODES.find(n => n.key === node)?.label ?? node
}

export type ProviderAction =
  | { type: 'provider_accept'; at: number; operatorName: string }
  | { type: 'provider_close'; at: number; operatorName: string; note: string; reason: CloseReason }
  | { type: 'provider_quote_submit'; at: number; operatorName: string; priceYuan: number; note?: string }
  | { type: 'resource_assign'; at: number; operatorName: string; assignment: Assignment }
  | { type: 'ground_depart'; at: number; operatorName: string; attachments?: Attachment[]; note?: string }
  | { type: 'pilot_start'; at: number; operatorName: string; attachments?: Attachment[]; note?: string }
  | { type: 'pilot_finish'; at: number; operatorName: string; result: Omit<WorkResult, 'evidence'> & { evidence?: Attachment[] } }
  | { type: 'finance_invoice'; at: number; operatorName: string; invoice: InvoiceInfo; receipt?: ReceiptInfo }

export function canPerformNode(role: ProviderRole, node: OrderNodeKey): boolean {
  if (role === 'admin') return true
  if (role === 'service') return node === 'provider_accept' || node === 'provider_quote' || node === 'resource_assign'
  if (role === 'ground') return node === 'ground_depart'
  if (role === 'pilot') return node === 'pilot_start' || node === 'pilot_finish'
  if (role === 'finance') return node === 'finance_invoice'
  return false
}

export function canCloseOrder(role: ProviderRole, order: ProviderOrder): boolean {
  if (order.lifecycleStatus !== 'in_progress') return false
  if (role === 'admin') return true
  if (role === 'service') {
    return (
      order.currentNode === 'provider_accept' ||
      order.currentNode === 'provider_quote' ||
      order.currentNode === 'user_confirm_quote'
    )
  }
  return false
}

export function canViewOrder(role: ProviderRole, order: ProviderOrder, employeeId?: string): boolean {
  if (role === 'admin' || role === 'service') return true
  if (role === 'finance') return true
  if (role === 'pilot') return order.assignment?.pilotEmployeeId === employeeId
  if (role === 'ground') return order.assignment?.groundEmployeeId === employeeId
  return false
}

export function orderIsClosed(order: ProviderOrder): boolean {
  return order.lifecycleStatus === 'closed'
}

export function orderIsCompleted(order: ProviderOrder): boolean {
  return order.lifecycleStatus === 'completed'
}

export function currentQuoteRound(order: ProviderOrder): QuoteRound | undefined {
  return order.quotes[order.quotes.length - 1]
}

export function nextQuoteRoundNumber(order: ProviderOrder): number {
  const last = order.quotes[order.quotes.length - 1]
  return (last?.round ?? 0) + 1
}

export function applyAction(order: ProviderOrder, role: ProviderRole, action: ProviderAction): ProviderOrder {
  if (orderIsClosed(order) || orderIsCompleted(order)) {
    throw new Error('ORDER_CLOSED')
  }

  if (action.type === 'provider_close') {
    if (!canCloseOrder(role, order)) throw new Error('FORBIDDEN')
  } else {
    // 节点必须匹配，且角色有权限
    // 议价例外：用户在 user_confirm_quote 拒绝后，服务商可再次提交报价（回到 provider_quote 行为）
    if (action.type === 'provider_quote_submit') {
      const last = currentQuoteRound(order)
      const allowRequote = order.currentNode === 'user_confirm_quote' && last?.userDecision === 'rejected'
      const allowFirstQuote = order.currentNode === 'provider_quote'
      if (!allowFirstQuote && !allowRequote) throw new Error('NODE_MISMATCH')
      if (!canPerformNode(role, 'provider_quote')) throw new Error('FORBIDDEN')
    } else if (action.type === 'provider_accept') {
      if (order.currentNode !== 'demand_submitted') throw new Error('NODE_MISMATCH')
      if (!canPerformNode(role, 'provider_accept')) throw new Error('FORBIDDEN')
    } else {
      const requiredNode = action.type as unknown as OrderNodeKey
      if (requiredNode !== order.currentNode) {
        throw new Error('NODE_MISMATCH')
      }
      if (!canPerformNode(role, order.currentNode)) {
        throw new Error('FORBIDDEN')
      }
    }
  }

  switch (action.type) {
    case 'provider_accept': {
      return withTimeline(order, {
        currentNode: 'provider_quote',
        timelineItem: {
          node: 'provider_accept',
          at: action.at,
          operatorRole: role,
          operatorName: action.operatorName,
          note: '已接单',
        },
      })
    }
    case 'provider_close': {
      return closeOrder(order, {
        at: action.at,
        operatorRole: role,
        operatorName: action.operatorName,
        reason: action.reason,
        note: action.note,
      })
    }
    case 'provider_quote_submit': {
      const round = nextQuoteRoundNumber(order)
      if (round > 3) throw new Error('QUOTE_ROUNDS_EXCEEDED')
      if (action.priceYuan <= 0) throw new Error('INVALID_PRICE')
      const quote: QuoteRound = {
        round,
        providerPriceYuan: action.priceYuan,
        providerNote: action.note,
        providerAt: action.at,
        userDecision: 'pending',
      }
      return withTimeline(order, {
        currentNode: 'user_confirm_quote',
        patch: { quotes: [...order.quotes, quote] },
        timelineItem: {
          node: 'provider_quote',
          at: action.at,
          operatorRole: role,
          operatorName: action.operatorName,
          note: `报价：${action.priceYuan} 元${action.note ? `（${action.note}）` : ''}`,
        },
      })
    }
    case 'resource_assign': {
      if (!action.assignment.pilotEmployeeId || !action.assignment.groundEmployeeId) {
        throw new Error('INVALID_ASSIGNMENT')
      }
      const assignParts = [`飞手(${action.assignment.pilotEmployeeId})`, `地勤(${action.assignment.groundEmployeeId})`]
      if (action.assignment.droneId) assignParts.push(`无人机(${action.assignment.droneId})`)
      if (action.assignment.vehicleId) assignParts.push(`车辆(${action.assignment.vehicleId})`)
      return withTimeline(order, {
        currentNode: 'ground_depart',
        patch: { assignment: action.assignment },
        timelineItem: {
          node: 'resource_assign',
          at: action.at,
          operatorRole: role,
          operatorName: action.operatorName,
          note: `分配：${assignParts.join(' / ')}`,
        },
      })
    }
    case 'ground_depart': {
      return withTimeline(order, {
        currentNode: 'pilot_start',
        timelineItem: {
          node: 'ground_depart',
          at: action.at,
          operatorRole: role,
          operatorName: action.operatorName,
          note: action.note ?? '已出发',
          attachments: action.attachments,
        },
      })
    }
    case 'pilot_start': {
      return withTimeline(order, {
        currentNode: 'pilot_finish',
        timelineItem: {
          node: 'pilot_start',
          at: action.at,
          operatorRole: role,
          operatorName: action.operatorName,
          note: action.note ?? '开始作业',
          attachments: action.attachments,
        },
      })
    }
    case 'pilot_finish': {
      const evidence = action.result.evidence ?? []
      const result: WorkResult = {
        actualWeightKg: action.result.actualWeightKg,
        actualVolumeCm: action.result.actualVolumeCm,
        actualAmountYuan: action.result.actualAmountYuan,
        evidence,
      }
      if (result.actualAmountYuan <= 0) throw new Error('INVALID_AMOUNT')
      return withTimeline(order, {
        currentNode: 'finance_invoice',
        patch: { workResult: result },
        timelineItem: {
          node: 'pilot_finish',
          at: action.at,
          operatorRole: role,
          operatorName: action.operatorName,
          note: `吊运结束，金额 ${result.actualAmountYuan} 元`,
          attachments: evidence,
        },
      })
    }
    case 'finance_invoice': {
      if (!action.invoice.invoiceNo) throw new Error('INVALID_INVOICE')

      const receipt = action.receipt ? {
        ...action.receipt,
        status: 'received' as const,
      } : undefined

      if (receipt && receipt.receivedAmountYuan <= 0) throw new Error('INVALID_RECEIPT')

      return withTimeline(order, {
        currentNode: 'user_rate',
        patch: { 
          invoice: action.invoice, 
          ...(receipt && { receipt })
        },
        timelineItem: {
          node: 'finance_invoice',
          at: action.at,
          operatorRole: role,
          operatorName: action.operatorName,
          note: receipt 
            ? `开票：${action.invoice.invoiceNo}；收款：${receipt.receivedAmountYuan} 元（${receipt.method}）`
            : `已开票：${action.invoice.invoiceNo}（待收款）`,
        },
      })
    }
  }
}

export function applyUserQuoteDecision(order: ProviderOrder, params: {
  at: number
  decision: 'accepted' | 'rejected'
  expectedPriceYuan?: number
  note?: string
}): ProviderOrder {
  if (order.lifecycleStatus !== 'in_progress') throw new Error('ORDER_CLOSED')
  if (order.currentNode !== 'user_confirm_quote') throw new Error('NODE_MISMATCH')
  const last = currentQuoteRound(order)
  if (!last) throw new Error('NO_QUOTE')
  if (last.userDecision !== 'pending') throw new Error('ALREADY_DECIDED')

  const patchedLast: QuoteRound = {
    ...last,
    userDecision: params.decision,
    userAt: params.at,
    userExpectedPriceYuan: params.decision === 'rejected' ? params.expectedPriceYuan : undefined,
    userNote: params.note,
  }
  const quotes = [...order.quotes.slice(0, -1), patchedLast]

  if (params.decision === 'accepted') {
    return withTimeline(order, {
      currentNode: 'resource_assign',
      patch: { quotes },
      timelineItem: {
        node: 'user_confirm_quote',
        at: params.at,
        operatorRole: 'user',
        operatorName: '用户',
        note: '确认报价',
      },
    })
  }

  return withTimeline(order, {
    currentNode: 'user_confirm_quote',
    patch: { quotes },
    timelineItem: {
      node: 'user_confirm_quote',
      at: params.at,
      operatorRole: 'user',
      operatorName: '用户',
      note: `拒绝报价${params.expectedPriceYuan ? `，期望 ${params.expectedPriceYuan} 元` : ''}`,
    },
  })
}

export type TimeoutResult =
  | { type: 'none' }
  | { type: 'auto_close'; reason: CloseReason; note: string }
  | { type: 'remind'; note: string }

export interface TimeoutConfig {
  acceptTimeoutMs: number // 默认 2h
  quoteConfirmTimeoutMs: number // 默认 24h
  bargainTimeoutMs: number // 默认 24h（无新报价）
  departReminderMs: number // 默认 1h（分配后未出发提醒）
}

export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  acceptTimeoutMs: 2 * 60 * 60 * 1000,
  quoteConfirmTimeoutMs: 24 * 60 * 60 * 1000,
  bargainTimeoutMs: 24 * 60 * 60 * 1000,
  departReminderMs: 60 * 60 * 1000,
}

export function evaluateTimeouts(order: ProviderOrder, now: number, cfg: TimeoutConfig = DEFAULT_TIMEOUT_CONFIG): TimeoutResult {
  if (order.lifecycleStatus !== 'in_progress') return { type: 'none' }

  if (order.currentNode === 'provider_accept') {
    if (now - order.createdAt > cfg.acceptTimeoutMs) {
      return { type: 'auto_close', reason: 'accept_timeout', note: '接单超时自动关闭' }
    }
  }

  if (order.currentNode === 'user_confirm_quote') {
    const lastQuote = currentQuoteRound(order)
    if (lastQuote && lastQuote.userDecision === 'pending') {
      if (now - lastQuote.providerAt > cfg.quoteConfirmTimeoutMs) {
        return { type: 'auto_close', reason: 'quote_confirm_timeout', note: '用户确认报价超时自动关闭' }
      }
    }
    if (lastQuote && lastQuote.userDecision === 'rejected') {
      // 议价：用户拒绝后，等待服务商新报价；无新报价超时关闭
      const lastActivityAt = lastQuote.userAt ?? lastQuote.providerAt
      if (now - lastActivityAt > cfg.bargainTimeoutMs) {
        return { type: 'auto_close', reason: 'bargain_timeout', note: '议价超时自动关闭' }
      }
    }
  }

  if (order.currentNode === 'ground_depart') {
    let assignedAt: number | undefined
    for (let i = order.timeline.length - 1; i >= 0; i--) {
      if (order.timeline[i]?.node === 'resource_assign') {
        assignedAt = order.timeline[i]?.at
        break
      }
    }
    if (assignedAt && now - assignedAt > cfg.departReminderMs) {
      return { type: 'remind', note: '资源已分配超过1小时，仍未点击“前往吊运地点”' }
    }
  }

  return { type: 'none' }
}

function closeOrder(order: ProviderOrder, params: {
  at: number
  operatorRole: ProviderRole
  operatorName: string
  reason: CloseReason
  note: string
}): ProviderOrder {
  return {
    ...order,
    lifecycleStatus: 'closed',
    closedAt: params.at,
    closeReason: params.reason,
    closeNote: params.note,
    timeline: [
      ...order.timeline,
      {
        node: order.currentNode,
        at: params.at,
        operatorRole: params.operatorRole,
        operatorName: params.operatorName,
        note: `关闭订单：${params.note}`,
      },
    ],
  }
}

function withTimeline(
  order: ProviderOrder,
  params: {
    currentNode: OrderNodeKey
    patch?: Partial<ProviderOrder>
    timelineItem: ProviderOrder['timeline'][number]
  },
): ProviderOrder {
  const isUserRate = params.currentNode === 'user_rate'
  const nextLifecycle = isUserRate
    ? 'completed'
    : order.lifecycleStatus === 'completed' && !isUserRate
      ? 'in_progress'
      : order.lifecycleStatus

  return {
    ...order,
    ...params.patch,
    currentNode: params.currentNode,
    timeline: [...order.timeline, params.timelineItem],
    lifecycleStatus: nextLifecycle,
  }
}

