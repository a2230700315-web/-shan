import { describe, expect, it } from 'vitest'
import {
  applyTimeouts,
  createDemandOrder,
  providerAccept,
  providerQuote,
  userConfirmQuote,
  userRejectQuote,
} from './orderMachine'
import type { UserOrderDemandForm } from './types'

function fixedRand() {
  return 0.123
}

function baseDemand(): UserOrderDemandForm {
  return {
    pickupAddress: '起点A',
    deliveryAddress: '终点B',
    pickupLat: 30,
    pickupLng: 104,
    deliveryLat: 30.1,
    deliveryLng: 104.1,
    horizontalDistanceKm: 5.5,
    verticalDistanceMeters: 12,
    cargoName: '物资',
    totalWeightKg: 100,
    maxSingleWeightKg: 50,
    lengthCm: 100,
    widthCm: 50,
    heightCm: 40,
    expectedDate: '2026-04-01',
    clientName: '张三',
    clientPhone: '13800000000',
    remark: null,
  }
}

describe('user-web orderMachine', () => {
  it('creates demand with submit node + message', () => {
    const now = 1_000_000
    const { order, messages } = createDemandOrder(now, fixedRand, baseDemand())
    expect(order.id).toMatch(/^SD-\d{8}-\d{3}$/)
    expect(order.currentNode).toBe('submit_demand')
    expect(order.nodes.find(n => n.key === 'submit_demand')?.time).toBe(now)
    expect(messages).toHaveLength(1)
    expect(messages[0].title).toBe('需求提交成功')
  })

  it('auto-close if accept timeout (2h)', () => {
    const now = 1_000_000
    const { order } = createDemandOrder(now, fixedRand, baseDemand())
    const later = now + 2 * 60 * 60 * 1000 + 1
    const res = applyTimeouts(later, fixedRand, order)
    expect(res.order.lifecycleStatus).toBe('closed')
    expect(res.order.closeReason).toContain('接单超时')
    expect(res.messages[0].title).toBe('订单已关闭')
  })

  it('quote -> awaiting user decision -> auto-close after 24h', () => {
    const now = 1_000_000
    let order = createDemandOrder(now, fixedRand, baseDemand()).order
    order = providerAccept(now + 1, fixedRand, order).order
    order = providerQuote(now + 2, fixedRand, order, 1200, '报价').order
    expect(order.awaitingUserQuoteDecision).toBe(true)
    const later = (order.quoteDecisionDeadlineAt ?? 0) + 1
    const res = applyTimeouts(later, fixedRand, order)
    expect(res.order.lifecycleStatus).toBe('closed')
    expect(res.order.closeReason).toContain('确认报价超时')
  })

  it('reject quote triggers provider re-quote path and limits 3 rounds', () => {
    const now = 1_000_000
    let order = createDemandOrder(now, fixedRand, baseDemand()).order
    order = providerAccept(now + 1, fixedRand, order).order
    order = providerQuote(now + 2, fixedRand, order, 2000).order

    const rej = userRejectQuote(now + 3, fixedRand, order, 1500, '太贵')
    order = rej.order
    expect(order.currentNode).toBe('provider_quote')
    expect(order.awaitingUserQuoteDecision).toBe(false)
    expect(order.quoteRounds[order.quoteRounds.length - 1]?.userDecision).toBe('reject')

    // round 2
    order = providerQuote(now + 4, fixedRand, order, 1800).order
    order = userRejectQuote(now + 5, fixedRand, order, 1600, '再降点').order
    // round 3
    order = providerQuote(now + 6, fixedRand, order, 1700).order
    order = userRejectQuote(now + 7, fixedRand, order, 1650, '最后一次').order

    expect(order.quoteRounds).toHaveLength(3)
    // no round 4 allowed
    const r4 = providerQuote(now + 8, fixedRand, order, 1600)
    expect(r4.order.quoteRounds).toHaveLength(3)
  })

  it('confirm quote sets node to resource_assign and emits message', () => {
    const now = 1_000_000
    let order = createDemandOrder(now, fixedRand, baseDemand()).order
    order = providerAccept(now + 1, fixedRand, order).order
    order = providerQuote(now + 2, fixedRand, order, 1200).order
    const res = userConfirmQuote(now + 3, fixedRand, order)
    expect(res.order.awaitingUserQuoteDecision).toBe(false)
    expect(res.order.currentNode).toBe('resource_assign')
    expect(res.order.nodes.find(n => n.key === 'user_confirm_quote')?.time).toBe(now + 3)
    expect(res.messages[0].title).toBe('报价已确认')
  })
})

