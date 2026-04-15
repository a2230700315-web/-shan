import type { Order, Drone, Vehicle, Rigging, Employee, Settlement, Review, DashboardStats } from './types'

// ===== Mock Data: 闪吊平台 =====

export const mockOrders: Order[] = [
  {
    id: 'SD-20260301-001',
    clientName: '国网四川电力',
    clientPhone: '028-88001234',
    pickupPoint: { lat: 30.572, lng: 104.066, label: '成都市金牛区金府路' },
    deliveryPoint: { lat: 30.612, lng: 104.128, label: '成华区龙潭工业园' },
    distance: 7.2,
    cargo: { name: '输电塔钢构件', totalWeight: 850, maxSingleWeight: 200, length: 3.5, width: 0.8, height: 0.6 },
    expectedTime: '2026-03-15 08:00-12:00',
    status: 'assigned',
    assignedPilot: '张鹏飞',
    assignedWorker: '李地勤',
    assignedDrone: 'DJI FlyCart 30',
    amount: 28500,
    createdAt: '2026-03-10 09:15',
    updatedAt: '2026-03-12 14:30',
    hasLocalProvider: true,
    logs: [
      { time: '2026-03-10 09:15', action: '需求创建', operator: '客户自助' },
      { time: '2026-03-11 10:20', action: '客服接单', operator: '王小明' },
      { time: '2026-03-12 14:30', action: '分配飞手：张鹏飞', operator: '王小明' },
    ]
  },
  {
    id: 'SD-20260301-002',
    clientName: '中建三局光伏项目部',
    clientPhone: '023-67005678',
    pickupPoint: { lat: 29.563, lng: 106.551, label: '重庆市渝北区金开大道' },
    deliveryPoint: { lat: 29.721, lng: 106.432, label: '北碚区山顶光伏基地' },
    distance: 21.5,
    cargo: { name: '光伏面板组件', totalWeight: 1200, maxSingleWeight: 80, length: 2.1, width: 1.0, height: 0.05 },
    expectedTime: '2026-03-20 06:00-18:00',
    status: 'working',
    assignedPilot: '陈天翔',
    assignedWorker: '赵安全',
    assignedDrone: 'EHang 216L',
    amount: 67800,
    createdAt: '2026-03-08 16:40',
    updatedAt: '2026-03-20 06:30',
    hasLocalProvider: true,
    logs: [
      { time: '2026-03-08 16:40', action: '需求创建', operator: '客户自助' },
      { time: '2026-03-09 08:00', action: '客服接单', operator: '刘销售' },
      { time: '2026-03-10 11:00', action: '分配飞手：陈天翔', operator: '刘销售' },
      { time: '2026-03-20 06:30', action: '开始作业', operator: '陈天翔' },
    ]
  },
  {
    id: 'SD-20260301-003',
    clientName: '应急管理局',
    clientPhone: '028-12345678',
    pickupPoint: { lat: 31.005, lng: 103.631, label: '都江堰市物资储备库' },
    deliveryPoint: { lat: 31.062, lng: 103.582, label: '映秀镇临时安置点' },
    distance: 8.9,
    cargo: { name: '应急救灾物资', totalWeight: 500, maxSingleWeight: 50, length: 0.8, width: 0.6, height: 0.5 },
    expectedTime: '2026-03-12 紧急',
    status: 'settling',
    assignedPilot: '张鹏飞',
    assignedWorker: '周勤务',
    assignedDrone: 'DJI FlyCart 30',
    amount: 15200,
    createdAt: '2026-03-12 03:20',
    updatedAt: '2026-03-12 18:00',
    hasLocalProvider: false,
    logs: [
      { time: '2026-03-12 03:20', action: '紧急需求创建', operator: '客户自助' },
      { time: '2026-03-12 03:35', action: '紧急接单', operator: '王小明' },
      { time: '2026-03-12 04:00', action: '分配飞手：张鹏飞', operator: '王小明' },
      { time: '2026-03-12 05:30', action: '开始作业', operator: '张鹏飞' },
      { time: '2026-03-12 18:00', action: '作业完成，等待结算', operator: '张鹏飞' },
    ]
  },
  {
    id: 'SD-20260301-004',
    clientName: '华润置地',
    clientPhone: '0755-86001111',
    pickupPoint: { lat: 30.540, lng: 104.073, label: '成都市武侯区建材市场' },
    deliveryPoint: { lat: 30.580, lng: 104.100, label: '锦江区在建楼盘' },
    distance: 5.1,
    cargo: { name: '建筑钢筋', totalWeight: 2000, maxSingleWeight: 300, length: 6.0, width: 0.3, height: 0.3 },
    expectedTime: '2026-04-01 07:00-17:00',
    status: 'pending',
    amount: 42000,
    createdAt: '2026-03-28 11:00',
    updatedAt: '2026-03-28 11:00',
    hasLocalProvider: true,
    logs: [
      { time: '2026-03-28 11:00', action: '需求创建', operator: '客户自助' },
    ]
  },
  {
    id: 'SD-20260301-005',
    clientName: '中国移动基站维护',
    clientPhone: '010-50001234',
    pickupPoint: { lat: 30.680, lng: 104.040, label: '彭州市设备仓库' },
    deliveryPoint: { lat: 30.820, lng: 103.950, label: '山区基站点位' },
    distance: 17.8,
    cargo: { name: '通信基站设备', totalWeight: 350, maxSingleWeight: 120, length: 1.2, width: 0.8, height: 1.0 },
    expectedTime: '2026-03-25 09:00-15:00',
    status: 'completed',
    assignedPilot: '陈天翔',
    assignedWorker: '李地勤',
    assignedDrone: 'DJI FlyCart 30',
    amount: 35600,
    createdAt: '2026-03-18 09:00',
    updatedAt: '2026-03-25 16:00',
    hasLocalProvider: false,
    logs: [
      { time: '2026-03-18 09:00', action: '需求创建', operator: '客户自助' },
      { time: '2026-03-18 10:00', action: '客服接单', operator: '刘销售' },
      { time: '2026-03-19 09:00', action: '分配飞手：陈天翔', operator: '刘销售' },
      { time: '2026-03-25 09:00', action: '开始作业', operator: '陈天翔' },
      { time: '2026-03-25 15:30', action: '作业完成', operator: '陈天翔' },
      { time: '2026-03-25 16:00', action: '财务结算完成', operator: '孙财务' },
    ]
  },
]

export const mockDrones: Drone[] = [
  { id: 'D001', model: 'DJI FlyCart 30', sn: 'FC30-2025-A001', maxPayload: 30, insuranceExpiry: '2027-06-15', status: 'available', totalFlightHours: 1250 },
  { id: 'D002', model: 'DJI FlyCart 30', sn: 'FC30-2025-A002', maxPayload: 30, insuranceExpiry: '2027-06-15', status: 'in_use', totalFlightHours: 980 },
  { id: 'D003', model: 'EHang 216L', sn: 'EH216-2025-B001', maxPayload: 220, insuranceExpiry: '2027-03-20', status: 'available', totalFlightHours: 620 },
  { id: 'D004', model: '御风未来 M1', sn: 'YF-M1-2025-C001', maxPayload: 150, insuranceExpiry: '2026-12-31', status: 'maintenance', totalFlightHours: 340 },
  { id: 'D005', model: 'DJI Mavic 3 Industry', sn: 'M3I-2024-D001', maxPayload: 2, insuranceExpiry: '2026-09-01', status: 'available', totalFlightHours: 2100 },
]

export const mockVehicles: Vehicle[] = [
  { id: 'V001', plate: '川A·88D01', type: '作业保障车', status: 'available' },
  { id: 'V002', plate: '川A·88D02', type: '设备运输车', status: 'available' },
  { id: 'V003', plate: '川A·88D03', type: '指挥通信车', status: 'maintenance' },
]

export const mockRiggings: Rigging[] = [
  { id: 'R001', name: '标准钢索吊具', type: '钢索', maxLoad: 500, status: 'available' },
  { id: 'R002', name: '软质吊带A型', type: '吊带', maxLoad: 200, status: 'available' },
  { id: 'R003', name: '重型四点吊框', type: '吊框', maxLoad: 1000, status: 'maintenance' },
  { id: 'R004', name: '快拆式挂钩', type: '挂钩', maxLoad: 300, status: 'available' },
]

export const mockEmployees: Employee[] = [
  { id: 'E001', name: '王小明', role: 'service', phone: '138****1234', completedOrders: 156, joinDate: '2024-06-01' },
  { id: 'E002', name: '刘销售', role: 'service', phone: '139****5678', completedOrders: 203, joinDate: '2024-03-15' },
  { id: 'E003', name: '张鹏飞', role: 'pilot', phone: '136****9012', completedOrders: 328, joinDate: '2024-01-10' },
  { id: 'E004', name: '陈天翔', role: 'pilot', phone: '137****3456', completedOrders: 275, joinDate: '2024-04-20' },
  { id: 'E005', name: '李地勤', role: 'pilot', phone: '135****7890', completedOrders: 189, joinDate: '2024-08-01' },
  { id: 'E006', name: '赵安全', role: 'pilot', phone: '133****2345', completedOrders: 142, joinDate: '2024-09-15' },
  { id: 'E007', name: '孙财务', role: 'finance', phone: '131****6789', completedOrders: 0, joinDate: '2024-05-01' },
  { id: 'E008', name: '周勤务', role: 'pilot', phone: '132****0123', completedOrders: 98, joinDate: '2025-01-01' },
]

export const mockSettlements: Settlement[] = [
  { orderId: 'SD-20260301-003', amount: 15200, status: 'unsettled', clientName: '应急管理局' },
  { orderId: 'SD-20260301-005', amount: 35600, status: 'settled', settledAt: '2026-03-25 16:00', clientName: '中国移动基站维护' },
  { orderId: 'SD-20260215-011', amount: 48000, status: 'archived', settledAt: '2026-02-20 10:00', clientName: '华电集团' },
  { orderId: 'SD-20260220-015', amount: 22800, status: 'archived', settledAt: '2026-02-25 14:00', clientName: '中交一公局' },
  { orderId: 'SD-20260225-018', amount: 91200, status: 'settled', settledAt: '2026-03-01 09:00', clientName: '国网甘肃电力' },
]

export const mockReviews: Review[] = [
  { id: 'RV001', clientName: '国网四川电力', rating: 5, comment: '响应速度极快，飞手操作专业，吊运精度远超预期。大大缩短了我们的工期，省去了传统索道架设的麻烦。', date: '2026-03-01', orderId: 'SD-20260215-008' },
  { id: 'RV002', clientName: '中建三局', rating: 5, comment: '光伏面板上山以前至少要3天人工搬运，现在一天就全部完成。效率提升了10倍，成本降低60%。', date: '2026-02-20', orderId: 'SD-20260210-005' },
  { id: 'RV003', clientName: '应急管理局', rating: 5, comment: '凌晨三点紧急需求，不到两小时就调度到位开始作业。灾区群众当天就收到了物资，为人民群众的生命安全赢得了宝贵时间。', date: '2026-03-13', orderId: 'SD-20260301-003' },
  { id: 'RV004', clientName: '中国移动', rating: 4, comment: '山区基站维护一直是老大难问题，有了无人机吊运省心多了。希望能进一步扩大服务范围。', date: '2026-03-26', orderId: 'SD-20260301-005' },
  { id: 'RV005', clientName: '华润置地', rating: 5, comment: '建筑工地上用无人机吊建材，既安全又高效。闪吊的服务非常规范，全程有操作日志可追溯。', date: '2026-02-15', orderId: 'SD-20260201-003' },
]

export const mockDashboardStats: DashboardStats = {
  totalOrders: 1286,
  totalRevenue: 18560000,
  safeFlightHours: 12850,
  avgRating: 4.9,
  pilotCount: 26,
  droneCount: 18,
}

export const mockMonthlyRevenue = [
  { month: '2025-04', revenue: 820000 },
  { month: '2025-05', revenue: 950000 },
  { month: '2025-06', revenue: 1120000 },
  { month: '2025-07', revenue: 1350000 },
  { month: '2025-08', revenue: 1480000 },
  { month: '2025-09', revenue: 1280000 },
  { month: '2025-10', revenue: 1560000 },
  { month: '2025-11', revenue: 1720000 },
  { month: '2025-12', revenue: 1890000 },
  { month: '2026-01', revenue: 1650000 },
  { month: '2026-02', revenue: 1950000 },
  { month: '2026-03', revenue: 2180000 },
]

// Service providers by region
export const serviceProviders = [
  { region: '成都', lat: 30.572, lng: 104.066, radius: 50 },
  { region: '重庆', lat: 29.563, lng: 106.551, radius: 40 },
  { region: '西安', lat: 34.264, lng: 108.943, radius: 30 },
]
