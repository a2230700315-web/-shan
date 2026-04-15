import { ReactNode, useMemo, useContext, createContext, useState, useEffect, useCallback } from 'react'
import type { ProviderOrder, NotificationItem } from './domain/types'
import { applyAction } from './domain/workflow'
import { mockOrders } from './domain/mockData'

const STORAGE_KEY_PILOT = 'shandiao.pilot-web.v1'

type PilotSession = {
  pilotId: string
  pilotName: string
}

interface PilotWebState {
  session: PilotSession
  orders: ProviderOrder[]
  notifications: NotificationItem[]
  applyToOrder: (orderId: string, action: any) => void
  markNotificationRead: (id: string) => void
}

const Ctx = createContext<PilotWebState | null>(null)

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function createNotification(base: Omit<NotificationItem, 'id'>): NotificationItem {
  return { ...base, id: uid('n') }
}

function markRead(n: NotificationItem, at: number): NotificationItem {
  return { ...n, readAt: at }
}

export function PilotWebProvider({ children }: { children: ReactNode }) {
  const [session] = useState<PilotSession>({ pilotId: 'pilot_001', pilotName: '演示飞手' })
  const [orders, setOrders] = useState<ProviderOrder[]>(mockOrders)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PILOT)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<{
        orders: ProviderOrder[]
        notifications: NotificationItem[]
      }>
      if (parsed.orders?.length) setOrders(parsed.orders)
      if (parsed.notifications?.length) setNotifications(parsed.notifications)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PILOT, JSON.stringify({ orders, notifications }))
    } catch {
      // ignore
    }
  }, [notifications, orders])

  const applyToOrder = useCallback((orderId: string, action: any) => {
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === orderId)
      if (idx < 0) return prev

      const order = prev[idx]
      const next = applyAction(order, 'pilot', { ...action, operatorName: session.pilotName })
      const copy = prev.slice()
      copy[idx] = next

      const at = action.at ?? Date.now()

      if (action.type === 'pilot_start') {
        setNotifications(p => [
          createNotification({
            createdAt: at,
            title: '已开始作业',
            content: `订单 ${orderId} 已开始吊运作业。`,
            relatedOrderId: orderId,
            level: 'info',
          }),
          ...p,
        ])
      } else if (action.type === 'pilot_finish') {
        setNotifications(p => [
          createNotification({
            createdAt: at,
            title: '作业已完成',
            content: `订单 ${orderId} 吊运作业已完成，等待验收。`,
            relatedOrderId: orderId,
            level: 'info',
          }),
          ...p,
        ])
      }

      return copy
    })
  }, [session.pilotName])

  const markNotificationRead = useCallback((id: string) => {
    const at = Date.now()
    setNotifications(prev => prev.map(n => (n.id === id ? markRead(n, at) : n)))
  }, [])

  const value = useMemo<PilotWebState>(() => ({
    session,
    orders,
    notifications,
    applyToOrder,
    markNotificationRead,
  }), [applyToOrder, markNotificationRead, notifications, orders, session])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePilotWeb() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePilotWeb must be used within PilotWebProvider')
  return ctx
}
