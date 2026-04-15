import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Complaint, UserMessage, UserOrder, UserOrderDemandForm, UserReview } from '../domain/types'
import {
  addReview,
  applyTimeouts,
  createDemandOrder,
  providerQuote,
  userConfirmQuote,
  userRejectQuote,
} from '../domain/orderMachine'

type ToastType = 'success' | 'error' | 'info'

interface UserWebState {
  orders: UserOrder[]
  messages: UserMessage[]
  complaints: Complaint[]
  toast: { message: string; type: ToastType } | null

  showToast: (message: string, type?: ToastType) => void
  createDemand: (demand: UserOrderDemandForm) => string
  getOrderById: (id: string) => UserOrder | undefined

  confirmQuote: (orderId: string) => void
  rejectQuote: (orderId: string, expectedPriceCny: number, reason: string) => void
  submitReview: (orderId: string, review: { rating: 1 | 2 | 3 | 4 | 5; comment?: string | null }) => void
  createComplaint: (input: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void

  markMessageRead: (messageId: string) => void
  markAllMessagesRead: () => void
}

const Ctx = createContext<UserWebState | null>(null)

function storageKey() {
  return 'shandiao.user-web.v3.1'
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function nowMs() {
  return Date.now()
}

function rand() {
  return Math.random()
}

function initialState() {
  return {
    orders: [] as UserOrder[],
    messages: [] as UserMessage[],
    complaints: [] as Complaint[],
  }
}

export function UserWebProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [messages, setMessages] = useState<UserMessage[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [toast, setToast] = useState<UserWebState['toast']>(null)
  const bootstrappedRef = useRef(false)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  // bootstrap + persist
  useEffect(() => {
    if (bootstrappedRef.current) return
    bootstrappedRef.current = true
    const parsed = safeParse<ReturnType<typeof initialState>>(localStorage.getItem(storageKey()))
    if (parsed) {
      setOrders(parsed.orders ?? [])
      setMessages(parsed.messages ?? [])
      setComplaints(parsed.complaints ?? [])
    } else {
      const s = initialState()
      setOrders(s.orders)
      setMessages(s.messages)
      setComplaints(s.complaints)
    }
  }, [])

  useEffect(() => {
    if (!bootstrappedRef.current) return
    
    // 先读取 localStorage 中的最新数据，合并后再写入
    try {
      const existing = safeParse<ReturnType<typeof initialState>>(localStorage.getItem(storageKey()))
      if (existing) {
        const existingOrderMap = new Map((existing.orders || []).map(o => [o.id, o]))
        const mergedOrders = orders.map(o => {
          const existingOrder = existingOrderMap.get(o.id)
          if (existingOrder && existingOrder.updatedAt > (o.updatedAt || 0)) {
            const existingNodeMap = new Map((existingOrder.nodes || []).map(n => [n.key, n]))
            const mergedNodes = o.nodes?.map(n => {
              const existingNode = existingNodeMap.get(n.key)
              if (existingNode && existingNode.time && !n.time) {
                return { ...n, time: existingNode.time }
              }
              if (existingNode && existingNode.time && n.time && existingNode.time > n.time) {
                return { ...n, time: existingNode.time }
              }
              return n
            }) || existingOrder.nodes || o.nodes
            return { ...o, nodes: mergedNodes, updatedAt: existingOrder.updatedAt, currentNode: existingOrder.currentNode || o.currentNode }
          }
          return o
        })
        localStorage.setItem(storageKey(), JSON.stringify({ orders: mergedOrders, messages, complaints }))
        return
      }
    } catch {
      // ignore
    }
    
    localStorage.setItem(storageKey(), JSON.stringify({ orders, messages, complaints }))
  }, [orders, messages, complaints])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const t = nowMs()
      
      // 从localStorage同步订单更新
      try {
        const parsed = safeParse<ReturnType<typeof initialState>>(localStorage.getItem(storageKey()))
        if (parsed?.orders?.length) {
          setOrders(prev => {
            let hasNew = false
            const merged = [...prev]
            for (const newOrder of parsed.orders!) {
              const idx = merged.findIndex(o => o.id === newOrder.id)
              if (idx >= 0) {
                const existing = merged[idx]
                if (newOrder.updatedAt >= (existing.updatedAt || 0)) {
                  // 直接使用新订单的节点和状态，确保同步完整
                  merged[idx] = { 
                    ...existing, 
                    ...newOrder,
                    quoteRounds: newOrder.quoteRounds || existing.quoteRounds,
                    demand: newOrder.demand || existing.demand,
                  }
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
        if (parsed?.messages?.length) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const newMessages = parsed.messages!.filter(m => !existingIds.has(m.id))
            return newMessages.length > 0 ? [...newMessages, ...prev] : prev
          })
        }
        if (parsed?.complaints?.length) {
          setComplaints(prev => {
            let hasNew = false
            const merged = [...prev]
            for (const newComplaint of parsed.complaints!) {
              const idx = merged.findIndex(c => c.id === newComplaint.id)
              if (idx >= 0) {
                const existing = merged[idx]
                if (newComplaint.updatedAt >= (existing.updatedAt || 0)) {
                  merged[idx] = { ...existing, ...newComplaint }
                  hasNew = true
                }
              } else {
                merged.unshift(newComplaint)
                hasNew = true
              }
            }
            return hasNew ? merged : prev
          })
        }
      } catch {
        // ignore
      }
      
      // 超时自动处理
      setOrders(prev => {
        let changed = false
        const next = prev.map(o => {
          const timeoutApplied = applyTimeouts(t, rand, o)
          if (timeoutApplied.messages.length) {
            changed = true
            setMessages(m => [...timeoutApplied.messages, ...m])
          }
          return timeoutApplied.order
        })
        return changed ? next : prev
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const updateOne = useCallback((orderId: string, updater: (order: UserOrder) => { order: UserOrder; messages: UserMessage[] }) => {
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === orderId)
      if (idx < 0) return prev
      const res = updater(prev[idx])
      if (res.messages.length) setMessages(m => [...res.messages, ...m])
      const next = [...prev]
      next[idx] = res.order
      return next
    })
  }, [])

  const createDemand = useCallback((demand: UserOrderDemandForm) => {
    const t = nowMs()
    const { order, messages: newMessages } = createDemandOrder(t, rand, demand)
    setOrders(prev => [order, ...prev])
    setMessages(prev => [...newMessages, ...prev])

    // 同步订单到服务商端
    try {
      const providerStorageKey = 'shandiao.providerWeb.v1'
      const providerRaw = localStorage.getItem(providerStorageKey)
      const providerData = providerRaw ? JSON.parse(providerRaw) : {}
      
      const providerOrder = {
        id: order.id,
        createdAt: order.createdAt,
        expectedAt: new Date(demand.expectedDate).getTime(),
        clientName: demand.clientName,
        clientPhone: demand.clientPhone,
        pickupPoint: {
          label: demand.pickupAddress,
          lat: demand.pickupLat ?? 0,
          lng: demand.pickupLng ?? 0,
        },
        deliveryPoint: {
          label: demand.deliveryAddress,
          lat: demand.deliveryLat ?? 0,
          lng: demand.deliveryLng ?? 0,
        },
        horizontalDistanceM: demand.horizontalDistanceKm * 1000,
        verticalDistanceM: demand.verticalDistanceMeters,
        cargo: {
          name: demand.cargoName,
          totalWeightKg: demand.totalWeightKg,
          maxSingleWeightKg: demand.maxSingleWeightKg,
          lengthCm: demand.lengthCm,
          widthCm: demand.widthCm,
          heightCm: demand.heightCm,
        },
        remark: demand.remark,
        lifecycleStatus: 'in_progress',
        currentNode: 'demand_submitted',
        quotes: [],
        timeline: [
          { node: 'demand_submitted', at: t, operatorRole: 'user', operatorName: demand.clientName, note: '提交需求' }
        ],
      }
      
      const existingOrders = providerData.orders || []
      const orderIndex = existingOrders.findIndex((o: any) => o.id === order.id)
      if (orderIndex >= 0) {
        existingOrders[orderIndex] = providerOrder
      } else {
        existingOrders.unshift(providerOrder)
      }
      
      providerData.orders = existingOrders
      localStorage.setItem(providerStorageKey, JSON.stringify(providerData))
    } catch (e) {
      console.error('同步订单到服务商端失败:', e)
    }

    return order.id
  }, [])

  const getOrderById = useCallback((id: string) => orders.find(o => o.id === id), [orders])

  const confirmQuote = useCallback((orderId: string) => {
    const t = nowMs();
    updateOne(orderId, o => userConfirmQuote(t, rand, o))
    
    // 将确认报价同步到服务商端
    try {
      // 获取用户端的订单
      const userOrder = orders.find(o => o.id === orderId);
      if (!userOrder) return;
      
      // 获取服务商端的订单列表
      const providerStorageKey = 'shandiao.providerWeb.v1'
      const providerRaw = localStorage.getItem(providerStorageKey)
      const providerData = providerRaw ? JSON.parse(providerRaw) : { orders: [] }
      
      // 更新服务商端的订单
      const providerOrders = providerData.orders || [];
      const providerOrderIndex = providerOrders.findIndex((o: any) => o.id === orderId);
      
      if (providerOrderIndex >= 0) {
        // 获取最后一轮报价
        const providerOrder = providerOrders[providerOrderIndex];
        const lastQuote = providerOrder.quotes[providerOrder.quotes.length - 1];
        
        if (lastQuote && lastQuote.userDecision === 'pending') {
          // 更新报价状态
          lastQuote.userDecision = 'accepted';
          lastQuote.userAt = t;
          
          // 更新订单状态
          providerOrder.currentNode = 'resource_assign';
          providerOrder.timeline.push({
            node: 'user_confirm_quote',
            at: t,
            operatorRole: 'user',
            operatorName: '用户',
            note: '确认报价'
          });
          
          // 保存回localStorage
          localStorage.setItem(providerStorageKey, JSON.stringify(providerData))
        }
      }
    } catch (e) {
      console.error('同步确认报价到服务商端失败:', e)
    }
  }, [updateOne, orders])

  const rejectQuote = useCallback((orderId: string, expectedPriceCny: number, reason: string) => {
    const t = nowMs();
    updateOne(orderId, o => userRejectQuote(t, rand, o, expectedPriceCny, reason))
    
    // 将拒绝报价同步到服务商端
    try {
      // 获取用户端的订单
      const userOrder = orders.find(o => o.id === orderId);
      if (!userOrder) return;
      
      // 获取服务商端的订单列表
      const providerStorageKey = 'shandiao.providerWeb.v1'
      const providerRaw = localStorage.getItem(providerStorageKey)
      const providerData = providerRaw ? JSON.parse(providerRaw) : { orders: [] }
      
      // 更新服务商端的订单
      const providerOrders = providerData.orders || [];
      const providerOrderIndex = providerOrders.findIndex((o: any) => o.id === orderId);
      
      if (providerOrderIndex >= 0) {
        // 获取最后一轮报价
        const providerOrder = providerOrders[providerOrderIndex];
        const lastQuote = providerOrder.quotes[providerOrder.quotes.length - 1];
        
        if (lastQuote && lastQuote.userDecision === 'pending') {
          // 更新报价状态
          lastQuote.userDecision = 'rejected';
          lastQuote.userAt = t;
          lastQuote.userExpectedPriceYuan = expectedPriceCny;
          lastQuote.userNote = reason;
          
          // 更新订单状态
          providerOrder.timeline.push({
            node: 'user_confirm_quote',
            at: t,
            operatorRole: 'user',
            operatorName: '用户',
            note: `拒绝报价，期望 ${expectedPriceCny} 元`
          });
          
          // 保存回localStorage
          localStorage.setItem(providerStorageKey, JSON.stringify(providerData))
        }
      }
    } catch (e) {
      console.error('同步拒绝报价到服务商端失败:', e)
    }
    
    // 演示：服务商 1 秒后重新报价（最多 3 轮）
    window.setTimeout(() => {
      updateOne(orderId, o => {
        const last = o.quoteRounds.length > 0 ? o.quoteRounds[o.quoteRounds.length - 1] : undefined
        const base = last?.providerPriceCny ?? 1000
        const nextPrice = Math.max(1, Math.round((base + expectedPriceCny) / 2))
        return providerQuote(nowMs(), rand, o, nextPrice, '根据议价调整后的报价')
      })
    }, 1000)
  }, [updateOne, orders])

  const submitReview = useCallback((orderId: string, review: { rating: 1 | 2 | 3 | 4 | 5; comment?: string | null }) => {
    const t = nowMs();
    updateOne(orderId, o => addReview(t, rand, o, { rating: review.rating, comment: review.comment ?? null, createdAt: t } satisfies UserReview))
    
    // 将评价同步到服务商端
    try {
      const providerStorageKey = 'shandiao.providerWeb.v1'
      const providerRaw = localStorage.getItem(providerStorageKey)
      const providerData = providerRaw ? JSON.parse(providerRaw) : { orders: [] }
      
      const providerOrders = providerData.orders || [];
      const providerOrderIndex = providerOrders.findIndex((o: any) => o.id === orderId);
      
      if (providerOrderIndex >= 0) {
        const providerOrder = providerOrders[providerOrderIndex];
        
        // 更新订单状态
        providerOrder.currentNode = 'user_rate';
        providerOrder.lifecycleStatus = 'completed';
        providerOrder.timeline.push({
          node: 'user_rate',
          at: t,
          operatorRole: 'user',
          operatorName: '用户',
          note: `评价：${review.rating} 星${review.comment ? `（${review.comment}）` : ''}`
        });
        
        // 保存回localStorage
        localStorage.setItem(providerStorageKey, JSON.stringify(providerData))
      }
    } catch (e) {
      console.error('同步评价到服务商端失败:', e)
    }
  }, [updateOne])

  const createComplaint = useCallback((input: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const t = nowMs()
    const id = `CP-${t}-${Math.floor(rand() * 1000)}`
    const complaint: Complaint = {
      id,
      status: 'pending',
      createdAt: t,
      updatedAt: t,
      ...input,
    }
    setComplaints(prev => [complaint, ...prev])
    setMessages(prev => [{
      id: `MSG-${t}-${Math.floor(rand() * 100000)}`,
      createdAt: t,
      channel: 'inbox',
      title: '投诉已提交',
      content: `你的投诉已提交，我们将尽快处理。工单号 ${id}`,
      orderId: input.orderId,
      readAt: null,
    }, ...prev])
    showToast('投诉已提交')
  }, [showToast])

  const markMessageRead = useCallback((messageId: string) => {
    const t = nowMs()
    setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, readAt: m.readAt ?? t } : m)))
  }, [])

  const markAllMessagesRead = useCallback(() => {
    const t = nowMs()
    setMessages(prev => prev.map(m => ({ ...m, readAt: m.readAt ?? t })))
  }, [])

  const value = useMemo<UserWebState>(() => ({
    orders,
    messages,
    complaints,
    toast,
    showToast,
    createDemand,
    getOrderById,
    confirmQuote,
    rejectQuote,
    submitReview,
    createComplaint,
    markMessageRead,
    markAllMessagesRead,
  }), [orders, messages, complaints, toast, showToast, createDemand, getOrderById, confirmQuote, rejectQuote, submitReview, createComplaint, markMessageRead, markAllMessagesRead])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUserWeb() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUserWeb must be used within UserWebProvider')
  return ctx
}

