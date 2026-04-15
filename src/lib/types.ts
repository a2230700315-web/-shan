// ===== 闪吊平台数据模型 =====

export type UserRole = 'client' | 'admin' | 'service' | 'pilot' | 'finance'

export interface User {
  id: string
  name: string
  role: UserRole
  phone: string
  completedOrders: number
}

export type OrderStatus = 'pending' | 'assigned' | 'working' | 'settling' | 'completed'

export interface Coordinate {
  lat: number
  lng: number
  label?: string
}

export interface CargoInfo {
  name: string
  totalWeight: number
  maxSingleWeight: number
  length: number
  width: number
  height: number
}

export interface Order {
  id: string
  clientName: string
  clientPhone: string
  pickupPoint: Coordinate
  deliveryPoint: Coordinate
  distance: number
  cargo: CargoInfo
  expectedTime: string
  status: OrderStatus
  assignedPilot?: string
  assignedWorker?: string
  assignedDrone?: string
  amount: number
  createdAt: string
  updatedAt: string
  logs: OrderLog[]
  hasLocalProvider: boolean
}

export interface OrderLog {
  time: string
  action: string
  operator: string
}

export type DroneStatus = 'available' | 'maintenance' | 'in_use'
export type VehicleStatus = 'available' | 'maintenance'

export interface Drone {
  id: string
  model: string
  sn: string
  maxPayload: number
  insuranceExpiry: string
  status: DroneStatus
  totalFlightHours: number
}

export interface Vehicle {
  id: string
  plate: string
  type: string
  status: VehicleStatus
}

export interface Rigging {
  id: string
  name: string
  type: string
  maxLoad: number
  status: 'available' | 'maintenance'
}

export interface Employee {
  id: string
  name: string
  role: UserRole
  phone: string
  completedOrders: number
  joinDate: string
}

export interface Settlement {
  orderId: string
  amount: number
  status: 'unsettled' | 'settled' | 'archived'
  settledAt?: string
  clientName: string
}

export interface Review {
  id: string
  clientName: string
  rating: number
  comment: string
  date: string
  orderId: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  safeFlightHours: number
  avgRating: number
  pilotCount: number
  droneCount: number
}
