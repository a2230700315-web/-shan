import type { ComplaintStatus } from '../types'

const order: ComplaintStatus[] = ['pending', 'processing', 'resolved']

export function canTransitionComplaint(from: ComplaintStatus, to: ComplaintStatus): boolean {
  if (from === to) return true
  const i = order.indexOf(from)
  const j = order.indexOf(to)
  if (i < 0 || j < 0) return false
  // 待处理 → 处理中 → 已解决（允许单步前进）
  return j === i + 1
}
