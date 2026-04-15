import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AdminGlobalOrder,
  AuditLogEntry,
  ComplaintTicket,
  ComplaintStatus,
  MessageTemplate,
  PlatformSession,
  PlatformOpsRole,
  PlatformUserRecord,
  PromotionBanner,
  ServiceProviderRecord,
} from '../types'
import {
  initialAuditLogs,
  initialBanners,
  initialComplaints,
  initialGlobalOrders,
  initialPlatformUsers,
  initialProviders,
  initialTemplates,
} from '../data/initialAdminData'
import { canTransitionComplaint } from '../lib/complaintWorkflow'
import { statusAfterClearException } from '../lib/orderException'

interface AdminConsoleValue {
  session: PlatformSession | null
  login: (username: string, password: string) => boolean
  logout: () => void

  providers: ServiceProviderRecord[]
  approveProvider: (id: string) => void
  rejectProvider: (id: string, reason: string) => void
  setProviderDisabled: (id: string, disabled: boolean) => void
  updateProviderRegions: (id: string, regions: string[]) => void
  updateProviderBasics: (
    id: string,
    payload: Pick<ServiceProviderRecord, 'companyName' | 'contactName' | 'contactPhone'>
  ) => void

  globalOrders: AdminGlobalOrder[]
  markOrderException: (id: string, note: string) => void
  clearOrderException: (id: string) => void

  complaints: ComplaintTicket[]
  advanceComplaint: (id: string, next: ComplaintStatus, payload?: { result?: string; suggestion?: string }) => void

  messageTemplates: MessageTemplate[]
  saveMessageTemplate: (t: Omit<MessageTemplate, 'id' | 'updatedAt'> & { id?: string }) => void
  setTemplateEnabled: (id: string, enabled: boolean) => void

  platformUsers: PlatformUserRecord[]
  setUserBlacklisted: (id: string, blacklisted: boolean) => void

  auditLogs: AuditLogEntry[]

  promotionBanners: PromotionBanner[]
  savePromotionBanner: (b: Omit<PromotionBanner, 'id'> & { id?: string }) => void
  setPromotionBannerEnabled: (id: string, enabled: boolean) => void
  removePromotionBanner: (id: string) => void
}

const AdminConsoleContext = createContext<AdminConsoleValue | null>(null)

function nowIso() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export function AdminConsoleProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PlatformSession | null>(null)
  const [providers, setProviders] = useState<ServiceProviderRecord[]>(() => [...initialProviders])
  const [globalOrders, setGlobalOrders] = useState<AdminGlobalOrder[]>(() =>
    initialGlobalOrders.map((o) => ({ ...o, timeline: o.timeline.map((e) => ({ ...e })) }))
  )
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => [...initialComplaints])
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(() => [...initialTemplates])
  const [platformUsers, setPlatformUsers] = useState<PlatformUserRecord[]>(() => [...initialPlatformUsers])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => [...initialAuditLogs])
  const [promotionBanners, setPromotionBanners] = useState<PromotionBanner[]>(() => [...initialBanners])

  const appendLog = useCallback((operator: string, action: string, detail: string) => {
    setAuditLogs((prev) => [
      {
        id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: nowIso(),
        operator,
        action,
        detail,
      },
      ...prev,
    ])
  }, [])

  const login = useCallback(
    (username: string, password: string) => {
      const u = username.trim()
      const p = password.trim()
      if (!u || !p) return false
      let role: PlatformOpsRole = 'ops_admin'
      let displayName = '运营管理员'
      if (u === 'super' && p === 'super123') {
        role = 'super_admin'
        displayName = '超级管理员'
      } else if (u === 'ops' && p === 'ops123') {
        role = 'ops_admin'
        displayName = '运营管理员'
      } else {
        return false
      }
      const s: PlatformSession = {
        username: u,
        displayName,
        role,
        loggedInAt: nowIso(),
      }
      setSession(s)
      appendLog(u, '登录', '管理后台独立入口登录成功（与服务商端会话隔离）')
      return true
    },
    [appendLog]
  )

  const logout = useCallback(() => {
    const u = session?.username ?? 'unknown'
    setSession(null)
    appendLog(u, '登出', '已退出管理后台')
  }, [appendLog, session?.username])

  const approveProvider = useCallback(
    (id: string) => {
      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, auditStatus: 'approved' as const, rejectedReason: undefined } : p))
      )
      appendLog(session?.username ?? 'system', '服务商审核', `通过入驻申请：${id}`)
    },
    [appendLog, session?.username]
  )

  const rejectProvider = useCallback(
    (id: string, reason: string) => {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, auditStatus: 'rejected' as const, rejectedReason: reason, disabled: true }
            : p
        )
      )
      appendLog(session?.username ?? 'system', '服务商审核', `驳回入驻申请：${id}；原因：${reason}`)
    },
    [appendLog, session?.username]
  )

  const setProviderDisabled = useCallback(
    (id: string, disabled: boolean) => {
      setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, disabled } : p)))
      appendLog(session?.username ?? 'system', '服务商状态', `${disabled ? '禁用' : '启用'}：${id}`)
    },
    [appendLog, session?.username]
  )

  const updateProviderRegions = useCallback(
    (id: string, regions: string[]) => {
      setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, regions: [...regions] } : p)))
      appendLog(session?.username ?? 'system', '服务区域', `更新服务商区域：${id}`)
    },
    [appendLog, session?.username]
  )

  const updateProviderBasics = useCallback(
    (id: string, payload: Pick<ServiceProviderRecord, 'companyName' | 'contactName' | 'contactPhone'>) => {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, companyName: payload.companyName, contactName: payload.contactName, contactPhone: payload.contactPhone }
            : p
        )
      )
      appendLog(session?.username ?? 'system', '服务商信息', `编辑服务商资料：${id}`)
    },
    [appendLog, session?.username]
  )

  const markOrderException = useCallback(
    (id: string, note: string) => {
      setGlobalOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'exception' as const, exceptionNote: note } : o))
      )
      appendLog(session?.username ?? 'system', '异常订单', `标记异常：${id}；${note}`)
    },
    [appendLog, session?.username]
  )

  const clearOrderException = useCallback(
    (id: string) => {
      setGlobalOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id || o.status !== 'exception') return o
          const nextStatus = statusAfterClearException(o)
          return { ...o, status: nextStatus, exceptionNote: undefined }
        })
      )
      appendLog(session?.username ?? 'system', '异常订单', `解除异常标记：${id}`)
    },
    [appendLog, session?.username]
  )

  const advanceComplaint = useCallback(
    (id: string, next: ComplaintStatus, payload?: { result?: string; suggestion?: string }) => {
      const op = session?.username ?? 'system'
      setComplaints((prev) => {
        const i = prev.findIndex((c) => c.id === id)
        if (i < 0) return prev
        const c = prev[i]
        if (!canTransitionComplaint(c.status, next)) return prev
        const updated: ComplaintTicket = {
          ...c,
          status: next,
          updatedAt: nowIso(),
          platformResult: payload?.result ?? c.platformResult,
          rectificationSuggestion: payload?.suggestion ?? c.rectificationSuggestion,
        }
        const copy = [...prev]
        copy[i] = updated
        queueMicrotask(() => appendLog(op, '投诉工单', `工单 ${id}：${c.status} → ${next}`))
        
        // 同步投诉处理结果到服务商端
        try {
          const providerStorageKey = 'shandiao.providerWeb.v1'
          const providerRaw = localStorage.getItem(providerStorageKey)
          const providerData = providerRaw ? JSON.parse(providerRaw) : { notifications: [] }
          
          // 添加通知到服务商端
          const notification = {
            id: `n-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            at: Date.now(),
            title: '投诉处理通知',
            content: `订单 ${c.orderNo} 的投诉已${next === 'resolved' ? '解决' : '处理中'}，${next === 'resolved' && payload?.result ? `处理结果：${payload.result}` : ''}${payload?.suggestion ? `整改建议：${payload.suggestion}` : ''}`,
            level: 'warning',
            relatedOrderId: c.orderNo,
            complaintId: c.id,
            toRole: 'admin',
            readAt: null,
          }
          
          providerData.notifications = [notification, ...(providerData.notifications || [])]
          localStorage.setItem(providerStorageKey, JSON.stringify(providerData))
        } catch (e) {
          console.error('同步投诉处理结果到服务商端失败:', e)
        }
        
        // 同步投诉处理结果到客户端
        try {
          const userStorageKey = 'shandiao.user-web.v3.1'
          const userRaw = localStorage.getItem(userStorageKey)
          const userData = userRaw ? JSON.parse(userRaw) : { complaints: [], messages: [] }
          
          // 更新客户端的投诉状态
          const existingComplaints = userData.complaints || []
          const complaintIndex = existingComplaints.findIndex((comp: any) => comp.id === c.id)
          if (complaintIndex >= 0) {
            existingComplaints[complaintIndex] = {
              ...existingComplaints[complaintIndex],
              status: next,
              updatedAt: Date.now(),
              result: payload?.result,
            }
          } else {
            // 如果客户端没有该投诉，创建一个新的投诉记录
            const newComplaint = {
              id: c.id,
              orderId: c.orderId,
              reason: 'other' as const,
              content: c.detail,
              evidenceImageUrls: c.imageUrls || [],
              status: next,
              createdAt: new Date(c.createdAt).getTime(),
              updatedAt: Date.now(),
              result: payload?.result,
            }
            existingComplaints.unshift(newComplaint)
          }
          
          // 添加客户端消息
          const newMessage = {
            id: `MSG-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            orderId: c.orderNo,
            title: '投诉处理结果',
            content: `您的投诉工单 ${c.id} 已${next === 'resolved' ? '解决' : '处理中'}。${next === 'resolved' && payload?.result ? `处理结果：${payload.result}` : ''}${payload?.suggestion ? `整改建议：${payload.suggestion}` : ''}`,
            channel: 'inbox' as const,
            createdAt: Date.now(),
            readAt: null
          }
          const existingMessages = userData.messages || []
          existingMessages.unshift(newMessage)
          
          // 保存回localStorage
          userData.complaints = existingComplaints
          userData.messages = existingMessages
          localStorage.setItem(userStorageKey, JSON.stringify(userData))
        } catch (e) {
          console.error('同步投诉处理结果到客户端失败:', e)
        }
        
        return copy
      })
    },
    [appendLog, session?.username]
  )

  const saveMessageTemplate = useCallback(
    (t: Omit<MessageTemplate, 'id' | 'updatedAt'> & { id?: string }) => {
      const ts = nowIso()
      if (t.id) {
        setMessageTemplates((prev) =>
          prev.map((x) =>
            x.id === t.id
              ? {
                  ...x,
                  name: t.name,
                  channel: t.channel,
                  trigger: t.trigger,
                  content: t.content,
                  enabled: t.enabled,
                  updatedAt: ts,
                }
              : x
          )
        )
        appendLog(session?.username ?? 'system', '消息模板', `更新模板：${t.id}`)
      } else {
        const id = `mt-${Date.now()}`
        setMessageTemplates((prev) => [
          ...prev,
          {
            id,
            name: t.name,
            channel: t.channel,
            trigger: t.trigger,
            content: t.content,
            enabled: t.enabled,
            updatedAt: ts,
          },
        ])
        appendLog(session?.username ?? 'system', '消息模板', `新增模板：${id}`)
      }
    },
    [appendLog, session?.username]
  )

  const setTemplateEnabled = useCallback(
    (id: string, enabled: boolean) => {
      setMessageTemplates((prev) =>
        prev.map((x) => (x.id === id ? { ...x, enabled, updatedAt: nowIso() } : x))
      )
      appendLog(session?.username ?? 'system', '消息模板', `${enabled ? '启用' : '停用'}：${id}`)
    },
    [appendLog, session?.username]
  )

  const setUserBlacklisted = useCallback(
    (id: string, blacklisted: boolean) => {
      setPlatformUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blacklisted } : u)))
      appendLog(session?.username ?? 'system', '用户黑名单', `${blacklisted ? '加入' : '移除'}：${id}`)
    },
    [appendLog, session?.username]
  )

  const savePromotionBanner = useCallback(
    (b: Omit<PromotionBanner, 'id'> & { id?: string }) => {
      if (b.id) {
        setPromotionBanners((prev) =>
          prev.map((x) =>
            x.id === b.id
              ? { ...x, title: b.title, imageUrl: b.imageUrl, linkUrl: b.linkUrl, sort: b.sort, enabled: b.enabled }
              : x
          )
        )
        appendLog(session?.username ?? 'system', '推广管理', `更新 Banner：${b.id}`)
      } else {
        const id = `bn-${Date.now()}`
        setPromotionBanners((prev) => [...prev, { id, ...b }])
        appendLog(session?.username ?? 'system', '推广管理', `新增 Banner：${id}`)
      }
    },
    [appendLog, session?.username]
  )

  const setPromotionBannerEnabled = useCallback(
    (id: string, enabled: boolean) => {
      setPromotionBanners((prev) => prev.map((x) => (x.id === id ? { ...x, enabled } : x)))
      appendLog(session?.username ?? 'system', '推广管理', `${enabled ? '启用' : '停用'} Banner：${id}`)
    },
    [appendLog, session?.username]
  )

  const removePromotionBanner = useCallback(
    (id: string) => {
      setPromotionBanners((prev) => prev.filter((x) => x.id !== id))
      appendLog(session?.username ?? 'system', '推广管理', `删除 Banner：${id}`)
    },
    [appendLog, session?.username]
  )

  const value = useMemo<AdminConsoleValue>(
    () => ({
      session,
      login,
      logout,
      providers,
      approveProvider,
      rejectProvider,
      setProviderDisabled,
      updateProviderRegions,
      updateProviderBasics,
      globalOrders,
      markOrderException,
      clearOrderException,
      complaints,
      advanceComplaint,
      messageTemplates,
      saveMessageTemplate,
      setTemplateEnabled,
      platformUsers,
      setUserBlacklisted,
      auditLogs,
      promotionBanners,
      savePromotionBanner,
      setPromotionBannerEnabled,
      removePromotionBanner,
    }),
    [
      session,
      login,
      logout,
      providers,
      approveProvider,
      rejectProvider,
      setProviderDisabled,
      updateProviderRegions,
      updateProviderBasics,
      globalOrders,
      markOrderException,
      clearOrderException,
      complaints,
      advanceComplaint,
      messageTemplates,
      saveMessageTemplate,
      setTemplateEnabled,
      platformUsers,
      setUserBlacklisted,
      auditLogs,
      promotionBanners,
      savePromotionBanner,
      setPromotionBannerEnabled,
      removePromotionBanner,
    ]
  )

  return <AdminConsoleContext.Provider value={value}>{children}</AdminConsoleContext.Provider>
}

export function useAdminConsole() {
  const ctx = useContext(AdminConsoleContext)
  if (!ctx) throw new Error('useAdminConsole must be used within AdminConsoleProvider')
  return ctx
}
