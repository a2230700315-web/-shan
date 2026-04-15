import type { ProviderEmployee, ProviderOrder } from './types'

export interface PilotPerf {
  employeeId: string
  name: string
  completedOrders: number
  avgLiftMinutes: number | null
}

export interface ServicePerf {
  employeeId: string
  name: string
  acceptedOrders: number
  avgQuoteMinutes: number | null
}

export interface GroundPerf {
  employeeId: string
  name: string
  departOrders: number
  onTimeRate: number | null
}

function minutesBetween(a: number, b: number) {
  return Math.max(0, (b - a) / 60000)
}

export function computePilotPerformance(orders: ProviderOrder[], employees: ProviderEmployee[]): PilotPerf[] {
  const pilots = employees.filter(e => e.role === 'pilot')
  return pilots.map(p => {
    const mine = orders.filter(o => o.assignment?.pilotEmployeeId === p.id && o.lifecycleStatus === 'completed')
    const durations: number[] = []
    for (const o of mine) {
      const start = o.timeline.find(t => t.node === 'pilot_start')?.at
      const end = o.timeline.find(t => t.node === 'pilot_finish')?.at
      if (start && end) durations.push(minutesBetween(start, end))
    }
    const avg = durations.length ? durations.reduce((s, x) => s + x, 0) / durations.length : null
    return { employeeId: p.id, name: p.name, completedOrders: mine.length, avgLiftMinutes: avg }
  })
}

export function computeServicePerformance(orders: ProviderOrder[], employees: ProviderEmployee[]): ServicePerf[] {
  const services = employees.filter(e => e.role === 'service' || e.role === 'admin')
  return services.map(s => {
    const accepted = orders.filter(o =>
      o.timeline.some(t => t.node === 'provider_accept' && t.operatorName === s.name),
    )
    const quoteDurations: number[] = []
    for (const o of accepted) {
      const acceptAt = o.timeline.find(t => t.node === 'provider_accept')?.at
      const quoteAt = o.timeline.find(t => t.node === 'provider_quote')?.at
      if (acceptAt && quoteAt) quoteDurations.push(minutesBetween(acceptAt, quoteAt))
    }
    const avg = quoteDurations.length ? quoteDurations.reduce((a, b) => a + b, 0) / quoteDurations.length : null
    return { employeeId: s.id, name: s.name, acceptedOrders: accepted.length, avgQuoteMinutes: avg }
  })
}

export function computeGroundPerformance(orders: ProviderOrder[], employees: ProviderEmployee[]): GroundPerf[] {
  const grounds = employees.filter(e => e.role === 'ground')
  return grounds.map(g => {
    const mine = orders.filter(o => o.assignment?.groundEmployeeId === g.id && o.lifecycleStatus === 'completed')
    let onTime = 0
    let total = 0
    for (const o of mine) {
      const departAt = o.timeline.find(t => t.node === 'ground_depart')?.at
      if (!departAt) continue
      total += 1
      if (departAt <= o.expectedAt) onTime += 1
    }
    const rate = total ? onTime / total : null
    return { employeeId: g.id, name: g.name, departOrders: mine.length, onTimeRate: rate }
  })
}

export function toCsv(rows: Record<string, string | number | null | undefined>[]) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0]!)
  const esc = (v: unknown) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  return [headers.join(','), ...rows.map(r => headers.map(h => esc((r as any)[h])).join(','))].join('\n')
}
