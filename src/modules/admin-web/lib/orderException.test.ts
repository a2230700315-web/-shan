import { describe, it, expect } from 'vitest'
import { statusAfterClearException } from './orderException'

describe('statusAfterClearException', () => {
  it('returns closed when current node indicates closed order', () => {
    expect(statusAfterClearException({ currentNode: '已关闭' })).toBe('closed')
    expect(statusAfterClearException({ currentNode: '订单关闭' })).toBe('closed')
  })

  it('returns in_progress otherwise', () => {
    expect(statusAfterClearException({ currentNode: '等待用户确认报价' })).toBe('in_progress')
    expect(statusAfterClearException({ currentNode: '吊运结束' })).toBe('in_progress')
  })
})
