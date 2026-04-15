import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Order, Drone, Vehicle, Rigging, Employee, Settlement, UserRole } from './types'
import { mockOrders, mockDrones, mockVehicles, mockRiggings, mockEmployees, mockSettlements } from './mockData'

interface AppState {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  orders: Order[]
  updateOrder: (id: string, updates: Partial<Order>) => void
  addOrder: (order: Order) => void
  drones: Drone[]
  updateDrone: (id: string, updates: Partial<Drone>) => void
  vehicles: Vehicle[]
  riggings: Rigging[]
  employees: Employee[]
  settlements: Settlement[]
  updateSettlement: (orderId: string, updates: Partial<Settlement>) => void
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('client')
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [drones, setDrones] = useState<Drone[]>(mockDrones)
  const [vehicles] = useState<Vehicle[]>(mockVehicles)
  const [riggings] = useState<Rigging[]>(mockRiggings)
  const [employees] = useState<Employee[]>(mockEmployees)
  const [settlements, setSettlements] = useState<Settlement[]>(mockSettlements)
  const [toast, setToast] = useState<AppState['toast']>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))
  }, [])

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev])
  }, [])

  const updateDrone = useCallback((id: string, updates: Partial<Drone>) => {
    setDrones(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }, [])

  const updateSettlement = useCallback((orderId: string, updates: Partial<Settlement>) => {
    setSettlements(prev => prev.map(s => s.orderId === orderId ? { ...s, ...updates } : s))
  }, [])

  return (
    <AppContext.Provider value={{
      currentRole, setCurrentRole,
      orders, updateOrder, addOrder,
      drones, updateDrone,
      vehicles, riggings, employees, settlements, updateSettlement,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
