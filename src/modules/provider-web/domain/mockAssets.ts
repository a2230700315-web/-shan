import type { FixedAsset } from './assets'

export const mockAssets: FixedAsset[] = [
  {
    id: 'a_drone_1',
    type: 'drone',
    name: 'DJI FlyCart 30',
    serialOrPlate: 'SN-FC30-0001',
    purchasedAt: Date.now() - 200 * 24 * 3600 * 1000,
    insuranceExpiryAt: Date.now() + 120 * 24 * 3600 * 1000,
    maintenanceDueAt: Date.now() + 10 * 24 * 3600 * 1000,
    status: 'available',
  },
  {
    id: 'a_vehicle_1',
    type: 'vehicle',
    name: '依维柯工程车',
    serialOrPlate: '苏A·A1234',
    purchasedAt: Date.now() - 900 * 24 * 3600 * 1000,
    insuranceExpiryAt: Date.now() + 300 * 24 * 3600 * 1000,
    status: 'available',
  },
]
