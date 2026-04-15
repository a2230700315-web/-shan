import { describe, it, expect } from 'vitest'
import { filterGlobalOrders } from './adminOrderQuery'
import type { AdminGlobalOrder } from '../types'

const sample: AdminGlobalOrder[] = [
  {
    id: 'a',
    orderNo: 'SD001',
    providerId: 'sp-1',
    providerName: 'A公司',
    clientName: '张三',
    clientPhone: '13800000000',
    currentNode: '待接单',
    status: 'in_progress',
    createdAt: '2026-04-01T10:00:00',
    timeline: [],
  },
  {
    id: 'b',
    orderNo: 'SD002',
    providerId: 'sp-2',
    providerName: 'B公司',
    clientName: '李四',
    clientPhone: '13900000000',
    currentNode: '已关闭',
    status: 'closed',
    createdAt: '2026-03-30T08:00:00',
    timeline: [],
  },
]

describe('filterGlobalOrders', () => {
  it('filters by status', () => {
    const r = filterGlobalOrders(sample, {
      status: 'closed',
      providerId: 'all',
      nodeContains: '',
      search: '',
      createdFrom: '',
      createdTo: '',
    })
    expect(r.map((x) => x.id)).toEqual(['b'])
  })

  it('filters by providerId', () => {
    const r = filterGlobalOrders(sample, {
      status: 'all',
      providerId: 'sp-1',
      nodeContains: '',
      search: '',
      createdFrom: '',
      createdTo: '',
    })
    expect(r.map((x) => x.id)).toEqual(['a'])
  })

  it('filters by node substring case-insensitive', () => {
    const r = filterGlobalOrders(sample, {
      status: 'all',
      providerId: 'all',
      nodeContains: '关闭',
      search: '',
      createdFrom: '',
      createdTo: '',
    })
    expect(r.map((x) => x.id)).toEqual(['b'])
  })

  it('filters by createdAt range (inclusive string compare)', () => {
    const r = filterGlobalOrders(sample, {
      status: 'all',
      providerId: 'all',
      nodeContains: '',
      search: '',
      createdFrom: '2026-04-01',
      createdTo: '2026-04-02',
    })
    expect(r.map((x) => x.id)).toEqual(['a'])
  })
})
