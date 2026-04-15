import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  NotificationItem,
  ProviderEmployee,
  ProviderOrder,
  ProviderRole,
} from './domain/types'

interface ProviderComplaint {
  id: string
  orderId: string
  orderNo: string
  userName: string
  reason: string
  detail: string
  imageUrls: string[]
  status: 'pending' | 'processing' | 'resolved'
  createdAt: string
  updatedAt: string
  platformResult?: string
  rectificationSuggestion?: string
}
import type { FixedAsset } from './domain/assets'
import { mockEmployees, mockOrders } from './domain/mockData'
import { mockAssets } from './domain/mockAssets'
import { applyAction, applyUserQuoteDecision, evaluateTimeouts, type ProviderAction } from './domain/workflow'
import { createNotification, markRead } from './domain/notifications'

const STORAGE_KEY = 'shandiao.providerWeb.v1'

type Session = {
  role: ProviderRole
  employeeId?: string
}

interface ProviderWebState {
  session: Session
  setSession: (s: Session) => void

  employees: ProviderEmployee[]
  upsertEmployee: (emp: ProviderEmployee) => void
  removeEmployee: (id: string) => void

  orders: ProviderOrder[]
  updateOrder: (order: ProviderOrder) => void
  addOrder: (order: ProviderOrder) => void

  assets: FixedAsset[]
  upsertAsset: (a: FixedAsset) => void
  removeAsset: (id: string) => void

  complaints: ProviderComplaint[]
  updateComplaints: (complaints: ProviderComplaint[]) => void

  notifications: NotificationItem[]
  markNotificationRead: (id: string) => void

  applyToOrder: (
    orderId: string,
    operator: { role: ProviderRole; name: string },
    action: ProviderAction,
  ) => void
  applyUserQuoteDecisionToOrder: (
    orderId: string,
    params: Parameters<typeof applyUserQuoteDecision>[1],
  ) => void
  resetDemoData: () => void
  tickTimeouts: () => void
}

const Ctx = createContext<ProviderWebState | null>(null)

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function syncNodeToUserWeb(
  orderId: string,
  _providerOrder: ProviderOrder,
  nodeKey: string,
  at: number,
  messageContent: string
) {
  try {
    const userStorageKey = 'shandiao.user-web.v3.1'
    const userRaw = localStorage.getItem(userStorageKey)
    const userData = userRaw ? JSON.parse(userRaw) : { orders: [], messages: [] }
    const userOrders = userData.orders || []
    const userOrderIndex = userOrders.findIndex((o: any) => o.id === orderId)

    if (userOrderIndex >= 0) {
      const userOrder = userOrders[userOrderIndex]
      const nodeKeyMap: Record<string, string> = {
        'demand_submitted': 'submit_demand',
        'provider_accept': 'provider_accept',
        'provider_quote': 'provider_quote',
        'user_confirm_quote': 'user_confirm_quote',
        'resource_assign': 'resource_assign',
        'ground_depart': 'depart_to_site',
        'pilot_start': 'start_work',
        'pilot_finish': 'finish_work',
        'finance_invoice': 'issue_invoice',
        'user_rate': 'user_review',
      }
      const userNodeKey = nodeKeyMap[nodeKey] || nodeKey

      let updatedNodes = userOrder.nodes?.map((n: any) => {
        if (n.key === userNodeKey) {
          return { ...n, time: at }
        }
        return n
      }) || userOrder.nodes

      if (userNodeKey === 'user_review') {
        // 确保 issue_invoice 节点存在且有时间戳
        const hasInvoiceNode = updatedNodes.some((n: any) => n.key === 'issue_invoice')
        if (hasInvoiceNode) {
          updatedNodes = updatedNodes.map((n: any) => {
            if (n.key === 'issue_invoice') {
              return { ...n, time: at }
            }
            return n
          })
        } else {
          // 如果没有 issue_invoice 节点，添加一个
          updatedNodes = [...(updatedNodes || []), {
            key: 'issue_invoice',
            time: at
          }]
        }
      }

      // 当服务商端财务开票时，用户端应该进入评价状态
      let targetCurrentNode = userNodeKey
      if (userNodeKey === 'issue_invoice') {
        targetCurrentNode = 'user_review'
      }

      const isCompleted = targetCurrentNode === 'user_review'
      userOrders[userOrderIndex] = {
        ...userOrder,
        nodes: updatedNodes,
        currentNode: targetCurrentNode,
        updatedAt: at,
        lifecycleStatus: isCompleted ? 'completed' : userOrder.lifecycleStatus,
      }

      userData.messages = [
        {
          id: `MSG-${at}-${Math.floor(Math.random() * 100000)}`,
          createdAt: at,
          channel: 'inbox',
          title: '订单进度更新',
          content: `订单 ${orderId}：${messageContent}`,
          orderId: orderId,
          readAt: null,
        },
        ...(userData.messages || []),
      ]

      localStorage.setItem(userStorageKey, JSON.stringify(userData))
    }
  } catch (e) {
    console.error('同步节点到用户端失败:', e)
  }
}

export function ProviderWebProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ role: 'admin', employeeId: 'e_admin' })
  const [employees, setEmployees] = useState<ProviderEmployee[]>(mockEmployees)
  const [orders, setOrders] = useState<ProviderOrder[]>([])
  const [assets, setAssets] = useState<FixedAsset[]>(mockAssets)
  const [complaints, setComplaints] = useState<ProviderComplaint[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    if (bootstrappedRef.current) return
    bootstrappedRef.current = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{
          session: Session
          employees: ProviderEmployee[]
          orders: ProviderOrder[]
          assets: FixedAsset[]
          complaints: ProviderComplaint[]
          notifications: NotificationItem[]
        }>
        if (parsed.session) setSession(parsed.session)
        if (parsed.employees?.length) setEmployees(parsed.employees)
        if (parsed.orders?.length) setOrders(parsed.orders)
        else setOrders(mockOrders)
        if (parsed.assets?.length) setAssets(parsed.assets)
        if (parsed.complaints?.length) setComplaints(parsed.complaints)
        if (parsed.notifications?.length) setNotifications(parsed.notifications)
      } else {
        setOrders(mockOrders)
      }
    } catch {
      setOrders(mockOrders)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw) as Partial<{
          orders: ProviderOrder[]
        }>
        if (parsed.orders?.length) {
          setOrders(prev => {
            let hasNew = false
            const merged = [...prev]
            for (const newOrder of parsed.orders!) {
              const idx = merged.findIndex(o => o.id === newOrder.id)
              if (idx >= 0) {
                if (JSON.stringify(merged[idx]) !== JSON.stringify(newOrder)) {
                  merged[idx] = newOrder
                  hasNew = true
                }
              } else {
                merged.unshift(newOrder)
                hasNew = true
              }
            }
            return hasNew ? merged : prev
          })
        }
      } catch {
        // ignore
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY)
      const existing = existingRaw ? JSON.parse(existingRaw) : {}
      const toSave = { 
        ...existing,
        session, 
        employees, 
        orders, 
        assets, 
        complaints,
        notifications 
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {
      // ignore
    }
  }, [assets, employees, complaints, notifications, orders, session])

  const updateOrder = useCallback((next: ProviderOrder) => {
    setOrders(prev => prev.map(o => (o.id === next.id ? next : o)))
  }, [])

  const addOrder = useCallback((order: ProviderOrder) => {
    setOrders(prev => [order, ...prev])
    
    // 发送通知给客服和管理员
    const at = Date.now()
    setNotifications(prev => [
      createNotification({
        id: uid('n'),
        at,
        title: '新的线下业务',
        content: `订单 ${order.id} 已录入，需要进行接单处理。`,
        relatedOrderId: order.id,
        toRole: 'service',
      }),
      ...prev
    ])
  }, [])

  const updateComplaints = useCallback((newComplaints: ProviderComplaint[]) => {
    setComplaints(newComplaints)
  }, [])

  const resetDemoData = useCallback(() => {
    setSession({ role: 'admin', employeeId: 'e_admin' })
    setEmployees(mockEmployees)
    setOrders(mockOrders)
    setAssets(mockAssets)
    setComplaints([])
    setNotifications([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const upsertEmployee = useCallback((emp: ProviderEmployee) => {
    setEmployees(prev => {
      const idx = prev.findIndex(e => e.id === emp.id)
      if (idx >= 0) {
        const copy = prev.slice()
        copy[idx] = emp
        return copy
      }
      return [emp, ...prev]
    })
  }, [])

  const removeEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id))
  }, [])

  const upsertAsset = useCallback((asset: FixedAsset) => {
    setAssets(prev => {
      const idx = prev.findIndex(a => a.id === asset.id)
      if (idx >= 0) {
        const copy = prev.slice()
        copy[idx] = asset
        return copy
      }
      return [asset, ...prev]
    })
  }, [])

  const removeAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    const at = Date.now()
    setNotifications(prev => prev.map(n => (n.id === id ? markRead(n, at) : n)))
  }, [])

  const applyToOrder: ProviderWebState['applyToOrder'] = useCallback((orderId, operator, action) => {
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === orderId)
      if (idx < 0) return prev

      const order = prev[idx]
      const next = applyAction(order, operator.role, { ...action, operatorName: operator.name })
      const copy = prev.slice()
      copy[idx] = next

      // 站内信：服务商侧关键节点通知
      const at = action.at ?? Date.now()
      const push = (n: NotificationItem) => setNotifications(p => [n, ...p])

      switch (action.type) {
        case 'provider_accept':
          push(createNotification({
            id: uid('n'),
            at,
            title: '已接单',
            content: `订单 ${orderId} 已接单，请尽快报价。`,
            relatedOrderId: orderId,
            toRole: 'service',
          }))
          // 同步接单到用户端
          try {
            const userStorageKey = 'shandiao.user-web.v3.1'
            const userRaw = localStorage.getItem(userStorageKey)
            const userData = userRaw ? JSON.parse(userRaw) : { orders: [], messages: [] }
            const userOrders = userData.orders || []
            const userOrderIndex = userOrders.findIndex((o: any) => o.id === orderId)
            
            if (userOrderIndex >= 0) {
              const userOrder = userOrders[userOrderIndex]
              const updatedNodes = userOrder.nodes?.map((n: any) => {
                if (n.key === 'provider_accept') {
                  return { ...n, time: at }
                }
                return n
              }) || userOrder.nodes
              
              userOrders[userOrderIndex] = {
                ...userOrder,
                nodes: updatedNodes,
                currentNode: 'provider_quote',
                updatedAt: at,
              }
              
              userData.messages = [
                {
                  id: `MSG-${at}-${Math.floor(Math.random() * 100000)}`,
                  createdAt: at,
                  channel: 'inbox',
                  title: '订单已接单',
                  content: `订单 ${orderId} 已被服务商接单，等待报价。`,
                  orderId: orderId,
                  readAt: null,
                },
                ...(userData.messages || []),
              ]
              
              localStorage.setItem(userStorageKey, JSON.stringify(userData))
            }
          } catch (e) {
            console.error('同步接单到用户端失败:', e)
          }
          break
        case 'provider_quote_submit':
          push(createNotification({
            id: uid('n'),
            at,
            title: '已提交报价',
            content: `订单 ${orderId} 报价已提交，等待用户确认。`,
            relatedOrderId: orderId,
            toRole: 'service',
          }))
          
          // 将报价同步到用户端
          try {
            // 获取服务商端的最新订单
            const providerOrder = next;
            
            // 转换为用户端订单格式
            const userOrder = {
              id: providerOrder.id,
              awaitingUserQuoteDecision: true,
              quoteRounds: providerOrder.quotes.map(q => ({
                round: q.round,
                providerPriceCny: q.providerPriceYuan,
                providerNote: q.providerNote,
                providerAt: q.providerAt,
                userDecision: q.userDecision === 'pending' ? null : q.userDecision,
                userAt: q.userAt,
                userExpectedPriceCny: q.userExpectedPriceYuan,
                userNote: q.userNote,
                createdAt: q.providerAt
              }))
            };
            
            // 获取用户端的订单列表
            const userStorageKey = 'shandiao.user-web.v3.1'
            const userRaw = localStorage.getItem(userStorageKey)
            const userData = userRaw ? JSON.parse(userRaw) : { orders: [], messages: [] }
            
            // 更新用户端的订单
            const userOrders = userData.orders || [];
            const userOrderIndex = userOrders.findIndex((o: any) => o.id === orderId);
            
            if (userOrderIndex >= 0) {
              // 更新现有订单
              const existingOrder = userOrders[userOrderIndex];
              const updatedNodes = existingOrder.nodes?.map((n: any) => {
                if (n.key === 'provider_quote') {
                  return { ...n, time: at }
                }
                return n
              }) || existingOrder.nodes
              
              userOrders[userOrderIndex] = {
                ...existingOrder,
                ...userOrder,
                nodes: updatedNodes,
                currentNode: 'user_confirm_quote',
                awaitingUserQuoteDecision: true,
                updatedAt: at
              };
            } else {
              // 如果用户端没有该订单，创建一个基本订单
              userOrders.push({
                ...userOrder,
                clientName: providerOrder.clientName,
                clientPhone: providerOrder.clientPhone,
                createdAt: providerOrder.createdAt,
                updatedAt: at,
                status: 'pending',
                logs: []
              });
            }
            
            // 添加用户端消息通知
            userData.messages = [
              {
                id: `MSG-${at}-${Math.floor(Math.random() * 100000)}`,
                createdAt: at,
                channel: 'inbox',
                title: '收到新报价',
                content: `订单 ${orderId} 收到新报价：${(action as any).priceYuan} 元${(action as any).note ? `（${(action as any).note}）` : ''}`,
                orderId: orderId,
                readAt: null,
              },
              ...(userData.messages || [])
            ];
            
            // 保存回localStorage
            localStorage.setItem(userStorageKey, JSON.stringify(userData))
            
          } catch (e) {
            console.error('同步报价到用户端失败:', e)
          }
          break
        case 'resource_assign':
          push(createNotification({
            id: uid('n'),
            at,
            title: '新任务待执行',
            content: `订单 ${orderId} 已分配任务，请按节点执行。`,
            relatedOrderId: orderId,
            toRole: 'pilot',
          }))
          push(createNotification({
            id: uid('n'),
            at,
            title: '新任务待执行',
            content: `订单 ${orderId} 已分配任务，请按节点执行。`,
            relatedOrderId: orderId,
            toRole: 'ground',
          }))
          syncNodeToUserWeb(orderId, next, 'resource_assign', at, '资源已分配，即将安排作业')
          break
        case 'ground_depart':
          syncNodeToUserWeb(orderId, next, 'ground_depart', at, '地勤已出发前往吊运地点')
          break
        case 'pilot_start':
          syncNodeToUserWeb(orderId, next, 'pilot_start', at, '飞手已开始吊运作业')
          break
        case 'pilot_finish':
          syncNodeToUserWeb(orderId, next, 'pilot_finish', at, '吊运作业已完成')
          break
        case 'finance_invoice':
          if (!action.receipt) {
            push(createNotification({
              id: uid('n'),
              at,
              title: '已开票（待收款）',
              content: `订单 ${orderId} 已记录发票信息，请尽快标记收款。`,
              relatedOrderId: orderId,
              toRole: 'finance',
            }))
            syncNodeToUserWeb(orderId, next, 'finance_invoice', at, '已开具发票，请评价服务')
          } else {
            push(createNotification({
              id: uid('n'),
              at,
              title: '已开票并收款',
              content: `订单 ${orderId} 已开票并记录收款，等待用户评价。`,
              relatedOrderId: orderId,
              toRole: 'finance',
            }))
            syncNodeToUserWeb(orderId, next, 'finance_invoice', at, '已开具发票并完成收款，请评价服务')
          }
          break
      }

      return copy
    })
  }, [])

  const applyUserQuoteDecisionToOrder: ProviderWebState['applyUserQuoteDecisionToOrder'] = useCallback((orderId, params) => {
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === orderId)
      if (idx < 0) return prev
      const order = prev[idx]
      const next = applyUserQuoteDecision(order, params)
      const copy = prev.slice()
      copy[idx] = next
      return copy
    })
  }, [])

  const tickTimeouts = useCallback(() => {
    const now = Date.now()
    setOrders(prev => prev.map(order => {
      const res = evaluateTimeouts(order, now)
      if (res.type === 'none') return order

      if (res.type === 'remind') {
        setNotifications(p => [
          createNotification({
            id: uid('n'),
            at: now,
            title: '节点提醒',
            content: `订单 ${order.id}：${res.note}`,
            level: 'warning',
            relatedOrderId: order.id,
            toRole: 'admin',
          }),
          ...p,
        ])
        return order
      }

      if (res.type === 'auto_close') {
        const closed: ProviderOrder = {
          ...order,
          lifecycleStatus: 'closed',
          closedAt: now,
          closeReason: res.reason,
          closeNote: res.note,
          timeline: [
            ...order.timeline,
            { node: order.currentNode, at: now, operatorRole: 'admin', operatorName: '系统', note: `自动关闭：${res.note}` },
          ],
        }
        setNotifications(p => [
          createNotification({
            id: uid('n'),
            at: now,
            title: '订单自动关闭',
            content: `订单 ${order.id} 已自动关闭（${res.note}）。`,
            level: 'warning',
            relatedOrderId: order.id,
            toRole: 'service',
          }),
          ...p,
        ])
        return closed
      }

      return order
    }))
  }, [])

  useEffect(() => {
    const t = window.setInterval(tickTimeouts, 30 * 1000)
    return () => window.clearInterval(t)
  }, [tickTimeouts])

  const value = useMemo<ProviderWebState>(() => ({
    session,
    setSession,
    employees,
    upsertEmployee,
    removeEmployee,
    orders,
    updateOrder,
    addOrder,
    assets,
    upsertAsset,
    removeAsset,
    complaints,
    updateComplaints,
    notifications,
    markNotificationRead,
    applyToOrder,
    applyUserQuoteDecisionToOrder,
    resetDemoData,
    tickTimeouts,
  }), [addOrder, applyToOrder, applyUserQuoteDecisionToOrder, assets, employees, complaints, updateComplaints, markNotificationRead, notifications, orders, removeAsset, removeEmployee, resetDemoData, session, tickTimeouts, updateOrder, upsertAsset, upsertEmployee])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProviderWeb() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProviderWeb must be used within ProviderWebProvider')
  return ctx
}

