import type { AdminGlobalOrder, AdminOrderStatus } from '../types'

/** 解除异常标记后，根据当前节点文案推断应恢复的订单状态 */
export function statusAfterClearException(order: Pick<AdminGlobalOrder, 'currentNode'>): Exclude<AdminOrderStatus, 'exception'> {
  const closed = order.currentNode.includes('关闭') || order.currentNode.includes('已关闭')
  return closed ? 'closed' : 'in_progress'
}
