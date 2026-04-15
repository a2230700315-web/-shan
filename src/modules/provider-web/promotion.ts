export interface PromotionCase {
  id: string
  url: string
  orderId?: string
  title?: string
}

const KEY = 'shandiao.providerWeb.promotionCases.v1'

export function loadPromotionCases(): PromotionCase[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as PromotionCase[]
  } catch {
    return []
  }
}

export function savePromotionCases(cases: PromotionCase[]) {
  localStorage.setItem(KEY, JSON.stringify(cases.slice(0, 20)))
}
