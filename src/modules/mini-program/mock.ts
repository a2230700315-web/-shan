import type { MiniOrderRecord } from './types'

export const MOCK_MINI_ORDER: MiniOrderRecord = {
  orderId: 'SD202604010001',
  currentNode: 'ISSUE_INVOICE',
  status: 'in_progress',
  negotiationRounds: [
    {
      round: 1,
      providerPrice: 3200,
      providerRemark: '含现场保障与基础保险',
      userDecision: 'reject',
      userExpectedPrice: 2800,
      userRemark: '预算有限，希望调整',
      submittedAt: '2026-04-01T09:15:00+08:00',
    },
    {
      round: 2,
      providerPrice: 2900,
      providerRemark: '已按常规作业方案调整',
      userDecision: 'confirm',
      submittedAt: '2026-04-01T10:00:00+08:00',
    },
  ],
  timeline: [
    { node: 'SUBMIT_DEMAND', done: true, operator: '用户-张三', operatedAt: '2026-04-01T08:30:00+08:00' },
    { node: 'PROVIDER_ACCEPT', done: true, operator: '客服-李四', operatedAt: '2026-04-01T08:50:00+08:00' },
    { node: 'PROVIDER_QUOTE', done: true, operator: '客服-李四', operatedAt: '2026-04-01T09:15:00+08:00' },
    { node: 'USER_CONFIRM_QUOTE', done: true, operator: '用户-张三', operatedAt: '2026-04-01T10:05:00+08:00' },
    { node: 'RESOURCE_ASSIGN', done: true, operator: '客服-李四', operatedAt: '2026-04-01T10:12:00+08:00' },
    { node: 'DEPART_TO_SITE', done: true, operator: '地勤-王五', operatedAt: '2026-04-01T10:40:00+08:00' },
    { node: 'START_LIFTING', done: true, operator: '飞手-赵六', operatedAt: '2026-04-01T11:05:00+08:00' },
    { node: 'FINISH_LIFTING', done: true, operator: '飞手-赵六', operatedAt: '2026-04-01T11:42:00+08:00' },
    { node: 'ISSUE_INVOICE', done: false },
    { node: 'USER_REVIEW', done: false },
  ],
  assignedPilotId: 'pilot-001',
  assignedGroundCrewId: 'ground-003',
}
