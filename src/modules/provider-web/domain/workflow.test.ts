import { describe, expect, it } from 'vitest'
import type { ProviderOrder } from './types'
import { applyAction, applyUserQuoteDecision, evaluateTimeouts } from './workflow'

function baseOrder(overrides: Partial<ProviderOrder> = {}): ProviderOrder {
  const now = Date.now()
  return {
    id: 'O1',
    createdAt: now - 1000,
    expectedAt: now + 3600_000,
    clientName: 'C',
    clientPhone: '1',
    pickupPoint: { label: 'A', lat: 0, lng: 0 },
    deliveryPoint: { label: 'B', lat: 0, lng: 0 },
    horizontalDistanceM: 1000,
    verticalDistanceM: 10,
    cargo: { name: 'X', totalWeightKg: 1, maxSingleWeightKg: 1, lengthCm: 10, widthCm: 10, heightCm: 10 },
    lifecycleStatus: 'in_progress',
    currentNode: 'provider_accept',
    quotes: [],
    timeline: [{ node: 'demand_submitted', at: now - 1000, operatorRole: 'user', operatorName: '用户', note: '提交需求' }],
    ...overrides,
  }
}

describe('provider workflow', () => {
  it('service can accept then quote', () => {
    const o1 = baseOrder({ currentNode: 'provider_accept' })
    const o2 = applyAction(o1, 'service', { type: 'provider_accept', at: o1.createdAt + 10, operatorName: '客服' })
    expect(o2.currentNode).toBe('provider_quote')

    const o3 = applyAction(o2, 'service', { type: 'provider_quote_submit', at: o1.createdAt + 20, operatorName: '客服', priceYuan: 1000 })
    expect(o3.currentNode).toBe('user_confirm_quote')
    expect(o3.quotes).toHaveLength(1)
    expect(o3.quotes[0]?.providerPriceYuan).toBe(1000)
  })

  it('ground cannot quote', () => {
    const o1 = baseOrder({ currentNode: 'provider_quote' })
    expect(() => applyAction(o1, 'ground', { type: 'provider_quote_submit', at: Date.now(), operatorName: '地勤', priceYuan: 1000 }))
      .toThrow('FORBIDDEN')
  })

  it('user accept moves to resource_assign', () => {
    const now = Date.now()
    const o1 = baseOrder({
      currentNode: 'user_confirm_quote',
      quotes: [{ round: 1, providerPriceYuan: 1000, providerAt: now - 1000, userDecision: 'pending' }],
    })
    const o2 = applyUserQuoteDecision(o1, { at: now, decision: 'accepted' })
    expect(o2.currentNode).toBe('resource_assign')
    expect(o2.quotes[0]?.userDecision).toBe('accepted')
    expect(o2.lifecycleStatus).toBe('in_progress')
  })

  it('user reject allows provider requote up to 3 rounds', () => {
    const now = Date.now()
    const o1 = baseOrder({
      currentNode: 'user_confirm_quote',
      quotes: [{ round: 1, providerPriceYuan: 1000, providerAt: now - 5000, userDecision: 'pending' }],
    })
    const o2 = applyUserQuoteDecision(o1, { at: now - 1000, decision: 'rejected', expectedPriceYuan: 800 })
    expect(o2.currentNode).toBe('user_confirm_quote')
    expect(o2.quotes[0]?.userDecision).toBe('rejected')

    const o3 = applyAction(o2, 'service', { type: 'provider_quote_submit', at: now, operatorName: '客服', priceYuan: 900 })
    expect(o3.quotes).toHaveLength(2)
    expect(o3.quotes[1]?.round).toBe(2)

    const o4: ProviderOrder = { ...o3, quotes: [...o3.quotes, { round: 3, providerPriceYuan: 850, providerAt: now + 1, userDecision: 'rejected', userAt: now + 2 }] }
    expect(() => applyAction(o4, 'service', { type: 'provider_quote_submit', at: now + 10, operatorName: '客服', priceYuan: 800 }))
      .toThrow('QUOTE_ROUNDS_EXCEEDED')
  })

  it('accept timeout auto close suggestion', () => {
    const now = Date.now()
    const o1 = baseOrder({ createdAt: now - 3 * 60 * 60 * 1000, currentNode: 'provider_accept' })
    const res = evaluateTimeouts(o1, now, { acceptTimeoutMs: 2 * 60 * 60 * 1000, quoteConfirmTimeoutMs: 24 * 60 * 60 * 1000, bargainTimeoutMs: 24 * 60 * 60 * 1000, departReminderMs: 60 * 60 * 1000 })
    expect(res.type).toBe('auto_close')
  })

  it('finance can invoice-only then receipt to complete', () => {
    const now = Date.now()
    const o1 = baseOrder({ currentNode: 'finance_invoice' })
    const o2 = applyAction(o1, 'finance', { type: 'finance_invoice', at: now, operatorName: '财务', invoice: { invoiceNo: 'INV-1', invoicedAt: now } })
    expect(o2.currentNode).toBe('finance_invoice')
    expect(o2.invoice?.invoiceNo).toBe('INV-1')
    expect(o2.receipt).toBeUndefined()

    const o3 = applyAction(o2, 'finance', {
      type: 'finance_invoice',
      at: now + 1,
      operatorName: '财务',
      invoice: { invoiceNo: 'INV-1', invoicedAt: now },
      receipt: { receivedAt: now + 1, receivedAmountYuan: 1000, method: 'bank_transfer' },
    })
    expect(o3.currentNode).toBe('user_rate')
    expect(o3.lifecycleStatus).toBe('completed')
  })
})

