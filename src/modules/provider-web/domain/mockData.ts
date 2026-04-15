import type { ProviderEmployee, ProviderOrder } from './types'

function nowMinus(ms: number) {
  return Date.now() - ms
}

export const mockEmployees: ProviderEmployee[] = [
  { id: 'e_admin', name: '王管理员', phone: '13800000001', role: 'admin', joinAt: nowMinus(400 * 24 * 3600 * 1000) },
  { id: 'e_service_1', name: '林客服', phone: '13800000002', role: 'service', joinAt: nowMinus(180 * 24 * 3600 * 1000) },
  { id: 'e_ground_1', name: '赵地勤', phone: '13800000003', role: 'ground', joinAt: nowMinus(200 * 24 * 3600 * 1000) },
  { id: 'e_pilot_1', name: '陈飞手', phone: '13800000004', role: 'pilot', joinAt: nowMinus(220 * 24 * 3600 * 1000), licenseNo: 'AOPA-DRONE-2025-001' },
  { id: 'e_finance_1', name: '周财务', phone: '13800000005', role: 'finance', joinAt: nowMinus(260 * 24 * 3600 * 1000) },
]

export const mockOrders: ProviderOrder[] = [
  {
    id: 'SD-20260401-0001',
    createdAt: nowMinus(30 * 60 * 1000),
    expectedAt: nowMinus(-6 * 60 * 60 * 1000),
    clientName: '华东光伏项目部',
    clientPhone: '13900001234',
    pickupPoint: { label: '上海市浦东新区 XX 工地', lat: 31.2304, lng: 121.4737, adcode: '310115' },
    deliveryPoint: { label: '上海市浦东新区 XX 变电站', lat: 31.2243, lng: 121.4767, adcode: '310115' },
    horizontalDistanceM: 3200,
    verticalDistanceM: 18,
    cargo: { name: '逆变器', totalWeightKg: 120, maxSingleWeightKg: 60, lengthCm: 80, widthCm: 60, heightCm: 45 },
    remark: '现场需佩戴安全帽，注意限高',
    lifecycleStatus: 'in_progress',
    currentNode: 'provider_accept',
    quotes: [],
    timeline: [{ node: 'demand_submitted', at: nowMinus(30 * 60 * 1000), operatorRole: 'user', operatorName: '用户', note: '提交需求' }],
  },
  {
    id: 'SD-20260401-0002',
    createdAt: nowMinus(5 * 60 * 60 * 1000),
    expectedAt: nowMinus(-2 * 60 * 60 * 1000),
    clientName: '张先生',
    clientPhone: '13700004321',
    pickupPoint: { label: '江苏省苏州市 XX 小区', lat: 31.2989, lng: 120.5853, adcode: '320500' },
    deliveryPoint: { label: '江苏省苏州市 XX 仓库', lat: 31.3065, lng: 120.5741, adcode: '320500' },
    horizontalDistanceM: 5100,
    verticalDistanceM: 12,
    cargo: { name: '应急物资箱', totalWeightKg: 35, maxSingleWeightKg: 20, lengthCm: 60, widthCm: 40, heightCm: 40 },
    lifecycleStatus: 'in_progress',
    currentNode: 'user_confirm_quote',
    quotes: [
      {
        round: 1,
        providerPriceYuan: 1800,
        providerAt: nowMinus(90 * 60 * 1000),
        providerNote: '含人力与设备调度',
        userDecision: 'rejected',
        userAt: nowMinus(60 * 60 * 1000),
        userExpectedPriceYuan: 1500,
        userNote: '希望优惠一些',
      },
    ],
    timeline: [
      { node: 'demand_submitted', at: nowMinus(5 * 60 * 60 * 1000), operatorRole: 'user', operatorName: '用户', note: '提交需求' },
      { node: 'provider_accept', at: nowMinus(4.5 * 60 * 60 * 1000), operatorRole: 'service', operatorName: '林客服', note: '已接单' },
      { node: 'provider_quote', at: nowMinus(90 * 60 * 1000), operatorRole: 'service', operatorName: '林客服', note: '报价：1800 元（含人力与设备调度）' },
    ],
  },
  {
    id: 'SD-20260330-0088',
    createdAt: nowMinus(3 * 24 * 60 * 60 * 1000),
    expectedAt: nowMinus(2 * 24 * 60 * 60 * 1000),
    clientName: '华北电力检修队',
    clientPhone: '13600002222',
    pickupPoint: { label: '河北省石家庄市 XX 站', lat: 38.0428, lng: 114.5149, adcode: '130100' },
    deliveryPoint: { label: '河北省石家庄市 XX 塔', lat: 38.05, lng: 114.52, adcode: '130100' },
    horizontalDistanceM: 2300,
    verticalDistanceM: 25,
    cargo: { name: '检修工具包', totalWeightKg: 28, maxSingleWeightKg: 14, lengthCm: 50, widthCm: 35, heightCm: 30 },
    lifecycleStatus: 'in_progress',
    currentNode: 'finance_invoice',
    quotes: [
      { round: 1, providerPriceYuan: 3200, providerAt: nowMinus(2.8 * 24 * 3600 * 1000), userDecision: 'accepted', userAt: nowMinus(2.75 * 24 * 3600 * 1000) },
    ],
    assignment: { pilotEmployeeId: 'e_pilot_1', groundEmployeeId: 'e_ground_1' },
    workResult: {
      actualWeightKg: 28,
      actualVolumeCm: { length: 50, width: 35, height: 30 },
      actualAmountYuan: 3200,
      evidence: [
        { id: 'att_1', kind: 'photo', name: '完工照片1.jpg', url: 'mock://photo/1' },
      ],
    },
    timeline: [
      { node: 'demand_submitted', at: nowMinus(3 * 24 * 3600 * 1000), operatorRole: 'user', operatorName: '用户', note: '提交需求' },
      { node: 'provider_accept', at: nowMinus(2.95 * 24 * 3600 * 1000), operatorRole: 'service', operatorName: '林客服', note: '已接单' },
      { node: 'provider_quote', at: nowMinus(2.8 * 24 * 3600 * 1000), operatorRole: 'service', operatorName: '林客服', note: '报价：3200 元' },
      { node: 'user_confirm_quote', at: nowMinus(2.75 * 24 * 3600 * 1000), operatorRole: 'user', operatorName: '用户', note: '确认报价' },
      { node: 'resource_assign', at: nowMinus(2.7 * 24 * 3600 * 1000), operatorRole: 'service', operatorName: '林客服', note: '已分配人员' },
      { node: 'ground_depart', at: nowMinus(2.65 * 24 * 3600 * 1000), operatorRole: 'ground', operatorName: '赵地勤', note: '已出发' },
      { node: 'pilot_start', at: nowMinus(2.62 * 24 * 3600 * 1000), operatorRole: 'pilot', operatorName: '陈飞手', note: '开始作业' },
      { node: 'pilot_finish', at: nowMinus(2.6 * 24 * 3600 * 1000), operatorRole: 'pilot', operatorName: '陈飞手', note: '吊运结束，金额 3200 元' },
    ],
  },
]

