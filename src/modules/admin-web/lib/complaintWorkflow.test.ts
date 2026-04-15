import { describe, it, expect } from 'vitest'
import { canTransitionComplaint } from './complaintWorkflow'

describe('canTransitionComplaint', () => {
  it('allows pending → processing', () => {
    expect(canTransitionComplaint('pending', 'processing')).toBe(true)
  })

  it('allows processing → resolved', () => {
    expect(canTransitionComplaint('processing', 'resolved')).toBe(true)
  })

  it('disallows pending → resolved skip', () => {
    expect(canTransitionComplaint('pending', 'resolved')).toBe(false)
  })

  it('disallows backwards transitions', () => {
    expect(canTransitionComplaint('processing', 'pending')).toBe(false)
    expect(canTransitionComplaint('resolved', 'processing')).toBe(false)
  })

  it('allows same state', () => {
    expect(canTransitionComplaint('pending', 'pending')).toBe(true)
  })
})
