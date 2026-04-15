export type FixedAssetType = 'drone' | 'vehicle' | 'rigging' | 'other'

export type FixedAssetStatus = 'available' | 'maintenance' | 'in_use'

export interface FixedAsset {
  id: string
  type: FixedAssetType
  name: string
  serialOrPlate: string
  purchasedAt: number
  insuranceExpiryAt?: number
  maintenanceDueAt?: number
  photoUrl?: string
  status: FixedAssetStatus
  note?: string
}
