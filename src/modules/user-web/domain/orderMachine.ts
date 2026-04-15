import type {
  QuoteRound,
  UserMessage,
  UserOrder,
  UserOrderDemandForm,
  UserOrderNode,
  UserOrderNodeKey,
  UserReview,
} from './types'

function makeId(prefix: string, now: number, suffix: string) {
  const d = new Date(now)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${prefix}-${y}${m}${day}-${suffix}`
}

export function createUserOrderId(now: number, rand: () => number) {
  const n = Math.floor(rand() * 1000)
  const suffix = String(n).padStart(3, '0')
  return makeId('SD', now, suffix)
}

export function createMessageId(now: number, rand: () => number) {
  const n = Math.floor(rand() * 1000000)
  return makeId('MSG', now, String(n).padStart(6, '0'))
}

export const nodeMeta: Record<UserOrderNodeKey, { label: string; operatorLabel: string }> = {
  submit_demand: { label: '提交需求', operatorLabel: '用户' },
  provider_accept: { label: '服务商接单', operatorLabel: '服务商' },
  provider_quote: { label: '服务商报价', operatorLabel: '服务商' },
  user_confirm_quote: { label: '用户确认报价', operatorLabel: '用户' },
  resource_assign: { label: '资源分配', operatorLabel: '服务商' },
  depart_to_site: { label: '前往吊运地点', operatorLabel: '服务商' },
  start_work: { label: '开始吊运', operatorLabel: '服务商' },
  finish_work: { label: '吊运结束', operatorLabel: '服务商' },
  issue_invoice: { label: '开具发票', operatorLabel: '服务商' },
  user_review: { label: '评价服务', operatorLabel: '用户' },
}

export function buildNodes(): UserOrderNode[] {
  const keys: UserOrderNodeKey[] = [
    'submit_demand',
    'provider_accept',
    'provider_quote',
    'user_confirm_quote',
    'resource_assign',
    'depart_to_site',
    'start_work',
    'finish_work',
    'issue_invoice',
    'user_review',
  ]
  return keys.map(k => ({ key: k, label: nodeMeta[k].label, operatorLabel: nodeMeta[k].operatorLabel, time: null }))
}

export interface StateUpdate {
  order: UserOrder
  messages: UserMessage[]
}

function lastQuote(quoteRounds: QuoteRound[]): QuoteRound | undefined {
  return quoteRounds.length > 0 ? quoteRounds[quoteRounds.length - 1] : undefined
}

function addNodeTime(order: UserOrder, key: UserOrderNodeKey, time: number, remark?: string | null): UserOrder {
  const nodes = order.nodes.map(n => (n.key === key ? { ...n, time, remark: remark ?? n.remark ?? null } : n))
  return { ...order, nodes }
}

function pushMessage(now: number, rand: () => number, partial: Omit<UserMessage, 'id' | 'createdAt' | 'readAt'>): UserMessage {
  return {
    id: createMessageId(now, rand),
    createdAt: now,
    channel: partial.channel,
    title: partial.title,
    content: partial.content,
    orderId: partial.orderId ?? null,
    readAt: null,
  }
}

export function createDemandOrder(now: number, rand: () => number, demand: UserOrderDemandForm): StateUpdate {
  const id = createUserOrderId(now, rand)
  let order: UserOrder = {
    id,
    lifecycleStatus: 'open',
    closeReason: null,
    createdAt: now,
    updatedAt: now,
    demand,
    currentNode: 'submit_demand',
    nodes: buildNodes(),
    quoteRounds: [],
    awaitingUserQuoteDecision: false,
    quoteDecisionDeadlineAt: null,
    acceptDeadlineAt: now + 2 * 60 * 60 * 1000,
    review: null,
  }
  order = addNodeTime(order, 'submit_demand', now)

  const msg = pushMessage(now, rand, {
    channel: 'inbox',
    orderId: id,
    title: '需求提交成功',
    content: `您的吊装需求已提交，订单号 ${id}，等待服务商接单。`,
  })

  return { order, messages: [msg] }
}

export function providerAccept(now: number, rand: () => number, order: UserOrder): StateUpdate {
  if (order.lifecycleStatus !== 'open') return { order, messages: [] }
  if (order.nodes.find(n => n.key === 'provider_accept')?.time) return { order, messages: [] }

  let next = addNodeTime({ ...order, updatedAt: now }, 'provider_accept', now)
  next = { ...next, currentNode: 'provider_quote' }

  const msg = pushMessage(now, rand, {
    channel: 'inbox',
    orderId: order.id,
    title: '服务商已接单',
    content: '服务商已接单，正在处理您的需求。',
  })
  return { order: next, messages: [msg] }
}

export function providerQuote(
  now: number,
  rand: () => number,
  order: UserOrder,
  providerPriceCny: number,
  providerNote?: string | null
): StateUpdate {
  if (order.lifecycleStatus !== 'open') return { order, messages: [] }
  if (order.quoteRounds.length >= 3) return { order, messages: [] }
  if (providerPriceCny <= 0 || !Number.isFinite(providerPriceCny)) return { order, messages: [] }

  const round: QuoteRound = {
    round: order.quoteRounds.length + 1,
    providerPriceCny,
    providerNote: providerNote ?? null,
    userDecision: null,
    userExpectedPriceCny: null,
    userRejectReason: null,
    createdAt: now,
    decidedAt: null,
  }

  let next = { ...order, updatedAt: now, quoteRounds: [...order.quoteRounds, round] }
  next = addNodeTime(next, 'provider_quote', now, providerNote ?? null)
  next = { ...next, currentNode: 'user_confirm_quote', awaitingUserQuoteDecision: true, quoteDecisionDeadlineAt: now + 24 * 60 * 60 * 1000 }

  const msg = pushMessage(now, rand, {
    channel: 'inbox',
    orderId: order.id,
    title: '服务商已报价',
    content: `服务商已报价 ${providerPriceCny} 元，请及时确认。`,
  })
  return { order: next, messages: [msg] }
}

export function userConfirmQuote(now: number, rand: () => number, order: UserOrder): StateUpdate {
  if (order.lifecycleStatus !== 'open') return { order, messages: [] }
  if (!order.awaitingUserQuoteDecision) return { order, messages: [] }
  const last = lastQuote(order.quoteRounds)
  if (!last) return { order, messages: [] }
  if (last.userDecision) return { order, messages: [] }

  const updatedRounds = order.quoteRounds.map(r =>
    r.round === last.round ? { ...r, userDecision: 'confirm' as const, decidedAt: now } : r
  )
  const base: UserOrder = {
    ...order,
    updatedAt: now,
    quoteRounds: updatedRounds,
    awaitingUserQuoteDecision: false,
    quoteDecisionDeadlineAt: null,
  }
  let next = addNodeTime(base, 'user_confirm_quote', now, '用户确认报价')
  next = { ...next, currentNode: 'resource_assign' }

  const msgToUser = pushMessage(now, rand, {
    channel: 'inbox',
    orderId: order.id,
    title: '报价已确认',
    content: '你已确认报价，服务商将尽快分配资源。',
  })
  return { order: next, messages: [msgToUser] }
}

export function userRejectQuote(
  now: number,
  rand: () => number,
  order: UserOrder,
  expectedPriceCny: number,
  reason: string
): StateUpdate {
  if (order.lifecycleStatus !== 'open') return { order, messages: [] }
  if (!order.awaitingUserQuoteDecision) return { order, messages: [] }
  const last = lastQuote(order.quoteRounds)
  if (!last) return { order, messages: [] }
  if (last.userDecision) return { order, messages: [] }
  if (!Number.isFinite(expectedPriceCny) || expectedPriceCny <= 0) return { order, messages: [] }

  const updatedRounds = order.quoteRounds.map(r =>
    r.round === last.round
      ? {
          ...r,
          userDecision: 'reject' as const,
          userExpectedPriceCny: expectedPriceCny,
          userRejectReason: reason,
          decidedAt: now,
        }
      : r
  )
  const next: UserOrder = {
    ...order,
    updatedAt: now,
    quoteRounds: updatedRounds,
    // 仍处于等待服务商重新报价状态：用户端只读
    awaitingUserQuoteDecision: false,
    quoteDecisionDeadlineAt: null,
    currentNode: 'provider_quote',
  }

  const msg = pushMessage(now, rand, {
    channel: 'inbox',
    orderId: order.id,
    title: '用户已拒绝报价',
    content: `用户拒绝报价，期望价 ${expectedPriceCny} 元。请在24小时内重新报价（最多3轮）。`,
  })
  return { order: next, messages: [msg] }
}

export function addReview(now: number, rand: () => number, order: UserOrder, review: UserReview): StateUpdate {
  const reviewNodeTime = order.nodes.find(n => n.key === 'user_review')?.time
  if (reviewNodeTime) return { order, messages: [] }
  if (review.rating < 1 || review.rating > 5) return { order, messages: [] }

  const withReview: UserOrder = { ...order, updatedAt: now, review }
  let next = addNodeTime(withReview, 'user_review', now, review.comment ?? null)
  next = { ...next, lifecycleStatus: 'completed' }

  const msg = pushMessage(now, rand, {
    channel: 'inbox',
    orderId: order.id,
    title: '感谢评价',
    content: '评价已提交，感谢你的反馈。',
  })
  return { order: next, messages: [msg] }
}

export function closeOrder(now: number, rand: () => number, order: UserOrder, closeReason: string): StateUpdate {
  if (order.lifecycleStatus !== 'open') return { order, messages: [] }
  const next: UserOrder = { ...order, updatedAt: now, lifecycleStatus: 'closed', closeReason }

  const msg = pushMessage(now, rand, {
    channel: 'inbox',
    orderId: order.id,
    title: '订单已关闭',
    content: `订单因${closeReason}关闭。`,
  })
  return { order: next, messages: [msg] }
}

export function applyTimeouts(now: number, rand: () => number, order: UserOrder): StateUpdate {
  if (order.lifecycleStatus !== 'open') return { order, messages: [] }

  // 2小时无人接单自动关闭
  const acceptedAt = order.nodes.find(n => n.key === 'provider_accept')?.time
  if (!acceptedAt && now > order.acceptDeadlineAt) {
    return closeOrder(now, rand, order, '接单超时')
  }

  // 报价后24小时用户未确认/拒绝自动关闭
  if (order.awaitingUserQuoteDecision && order.quoteDecisionDeadlineAt && now > order.quoteDecisionDeadlineAt) {
    return closeOrder(now, rand, order, '确认报价超时')
  }

  // 用户拒绝后，若24小时内无新报价（这里以“最后一次报价的 createdAt +24h 且未产生新报价”近似）
  const last = lastQuote(order.quoteRounds)
  if (last && last.userDecision === 'reject') {
    const deadline = last.decidedAt ? last.decidedAt + 24 * 60 * 60 * 1000 : last.createdAt + 24 * 60 * 60 * 1000
    const hasNewQuote = order.quoteRounds.length > last.round
    if (!hasNewQuote && now > deadline) {
      return closeOrder(now, rand, order, '议价超时')
    }
  }

  return { order, messages: [] }
}

// 仅用于前端演示/联调：确认报价后，模拟服务商按节点推进
export function simulateProviderWorkProgress(now: number, rand: () => number, order: UserOrder): StateUpdate {
  if (order.lifecycleStatus !== 'open') return { order, messages: [] }
  const idx = (k: UserOrderNodeKey) => order.nodes.findIndex(n => n.key === k)
  const has = (k: UserOrderNodeKey) => (order.nodes[idx(k)]?.time ?? null) !== null

  const steps: { from: UserOrderNodeKey; to: UserOrderNodeKey; msgTitle: string; msgContent: string }[] = [
    { from: 'resource_assign', to: 'resource_assign', msgTitle: '资源已分配', msgContent: '服务商已完成资源分配。' },
    { from: 'depart_to_site', to: 'depart_to_site', msgTitle: '已出发', msgContent: '飞手已出发前往吊运地点，请保持电话畅通。' },
    { from: 'start_work', to: 'start_work', msgTitle: '开始吊运', msgContent: '飞手已开始吊运，可在订单中查看节点进展。' },
    { from: 'finish_work', to: 'finish_work', msgTitle: '吊运已完成', msgContent: '吊运已完成，请查看订单并评价。' },
    { from: 'issue_invoice', to: 'issue_invoice', msgTitle: '已开具发票', msgContent: '服务商已开具发票，可联系获取。' },
  ]

  const current = order.currentNode
  const nextStep = steps.find(s => s.from === current)
  if (!nextStep) return { order, messages: [] }
  if (has(nextStep.to)) return { order, messages: [] }

  let next = addNodeTime({ ...order, updatedAt: now }, nextStep.to, now)
  const nextNodeIdx = idx(nextStep.to) + 1
  const nextNode = next.nodes[nextNodeIdx]?.key
  if (nextNode) next = { ...next, currentNode: nextNode }

  const msg = pushMessage(now, rand, { channel: 'inbox', orderId: order.id, title: nextStep.msgTitle, content: nextStep.msgContent })
  return { order: next, messages: [msg] }
}

