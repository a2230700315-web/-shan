import type { AdminGlobalOrder, AdminOrderStatus } from '../types'

export interface GlobalOrderQuery {
  status: AdminOrderStatus | 'all'
  providerId: string | 'all'
  nodeContains: string
  search: string
  createdFrom: string
  createdTo: string
}

export function filterGlobalOrders(orders: AdminGlobalOrder[], q: GlobalOrderQuery): AdminGlobalOrder[] {
  const node = q.nodeContains.trim().toLowerCase()
  const s = q.search.trim().toLowerCase()
  const from = q.createdFrom.trim()
  const to = q.createdTo.trim()

  return orders.filter((o) => {
    if (q.status !== 'all' && o.status !== q.status) return false
    if (q.providerId !== 'all' && o.providerId !== q.providerId) return false
    if (node && !o.currentNode.toLowerCase().includes(node)) return false
    if (s) {
      const hit =
        o.orderNo.toLowerCase().includes(s) ||
        o.clientName.toLowerCase().includes(s) ||
        o.providerName.toLowerCase().includes(s) ||
        o.clientPhone.includes(s)
      if (!hit) return false
    }
    if (from && o.createdAt < from) return false
    if (to && o.createdAt > to) return false
    return true
  })
}
