import type { NotificationItem, ProviderRole } from './types'

export function createNotification(params: {
  id: string
  at: number
  title: string
  content: string
  level?: NotificationItem['level']
  relatedOrderId?: string
  toRole?: ProviderRole
  toEmployeeId?: string
}): NotificationItem {
  return {
    id: params.id,
    createdAt: params.at,
    title: params.title,
    content: params.content,
    level: params.level ?? 'info',
    relatedOrderId: params.relatedOrderId,
    toRole: params.toRole,
    toEmployeeId: params.toEmployeeId,
  }
}

export function markRead(n: NotificationItem, at: number): NotificationItem {
  if (n.readAt) return n
  return { ...n, readAt: at }
}

export function unreadCount(list: NotificationItem[], filter?: { toRole?: ProviderRole; toEmployeeId?: string }): number {
  return list.filter(n => {
    if (n.readAt) return false
    if (filter?.toEmployeeId && n.toEmployeeId && n.toEmployeeId !== filter.toEmployeeId) return false
    if (filter?.toRole && n.toRole && n.toRole !== filter.toRole) return false
    return true
  }).length
}

