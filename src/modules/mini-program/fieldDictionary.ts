import type { OrderNodeCode } from './types'

export interface FieldSpec {
  key: string
  label: string
  required: boolean
  type: 'string' | 'number' | 'date' | 'datetime' | 'phone' | 'enum' | 'image[]' | 'video[]'
  description: string
}

export const DEMAND_FORM_FIELDS: FieldSpec[] = [
  { key: 'pickupAddress', label: '起始点地址', required: true, type: 'string', description: '地图选点/文本输入' },
  { key: 'deliveryAddress', label: '送达点地址', required: true, type: 'string', description: '地图选点/文本输入' },
  { key: 'horizontalDistance', label: '水平距离', required: true, type: 'number', description: '系统自动计算，可手动修正' },
  { key: 'verticalDistance', label: '垂直距离', required: true, type: 'number', description: '高程估算，可手动修正' },
  { key: 'cargoName', label: '物资名称', required: true, type: 'string', description: '具体物资名称' },
  { key: 'totalWeightKg', label: '总重量(kg)', required: true, type: 'number', description: '吊装总重量' },
  { key: 'maxSingleItemKg', label: '单件最大质量(kg)', required: true, type: 'number', description: '单件最大质量' },
  { key: 'volumeCubicCm', label: '体积(cm³)', required: true, type: 'number', description: '长宽高换算体积' },
  { key: 'expectedDate', label: '期望日期', required: true, type: 'date', description: '用户期望作业日期' },
  { key: 'contactName', label: '联系人', required: true, type: 'string', description: '联系人姓名' },
  { key: 'contactPhone', label: '联系电话', required: true, type: 'phone', description: '手机号' },
  { key: 'remark', label: '备注说明', required: false, type: 'string', description: '特殊要求说明' },
]

export const NODE_ACTION_FIELDS: Record<OrderNodeCode, FieldSpec[]> = {
  SUBMIT_DEMAND: DEMAND_FORM_FIELDS,
  PROVIDER_ACCEPT: [
    { key: 'acceptDecision', label: '接单决策', required: true, type: 'enum', description: 'accept/close' },
    { key: 'closeReason', label: '关闭理由', required: false, type: 'string', description: '当关闭订单时必填' },
  ],
  PROVIDER_QUOTE: [
    { key: 'quoteAmount', label: '报价金额', required: true, type: 'number', description: '服务商报价金额' },
    { key: 'quoteRemark', label: '报价说明', required: false, type: 'string', description: '可选备注' },
  ],
  USER_CONFIRM_QUOTE: [
    { key: 'quoteDecision', label: '报价确认', required: true, type: 'enum', description: 'confirm/reject' },
    { key: 'expectedPrice', label: '期望价格', required: false, type: 'number', description: '拒绝报价时填写' },
    { key: 'rejectRemark', label: '拒绝说明', required: false, type: 'string', description: '拒绝报价时填写' },
  ],
  RESOURCE_ASSIGN: [
    { key: 'pilotId', label: '飞手', required: true, type: 'string', description: '分配飞手ID' },
    { key: 'groundCrewId', label: '地勤', required: true, type: 'string', description: '分配地勤ID' },
  ],
  DEPART_TO_SITE: [
    { key: 'departedAt', label: '出发时间', required: true, type: 'datetime', description: '记录出发时间' },
    { key: 'departPhotos', label: '出发照片', required: false, type: 'image[]', description: '移动端拍照上传' },
  ],
  START_LIFTING: [
    { key: 'startedAt', label: '开始时间', required: true, type: 'datetime', description: '记录开始吊运时间' },
    { key: 'startPhotos', label: '作业开始照片', required: false, type: 'image[]', description: '可上传作业开始照片' },
  ],
  FINISH_LIFTING: [
    { key: 'finishedAt', label: '结束时间', required: true, type: 'datetime', description: '记录吊运结束时间' },
    { key: 'actualWeightKg', label: '实际重量(kg)', required: true, type: 'number', description: '用于服务商内部统计' },
    { key: 'actualVolumeCubicCm', label: '实际体积(cm³)', required: true, type: 'number', description: '用于服务商内部统计' },
    { key: 'actualAmount', label: '实际金额', required: true, type: 'number', description: '用于服务商内部统计' },
    { key: 'proofPhotos', label: '作业照片', required: false, type: 'image[]', description: '作业凭证照片' },
    { key: 'proofVideos', label: '作业视频', required: false, type: 'video[]', description: '作业凭证视频' },
  ],
  ISSUE_INVOICE: [
    { key: 'invoiceNo', label: '发票号码', required: true, type: 'string', description: '开具发票编号' },
    { key: 'invoiceIssuedAt', label: '开票时间', required: true, type: 'datetime', description: '开具发票时间' },
    { key: 'paymentMethod', label: '收款方式', required: true, type: 'enum', description: '现金/转账/其他' },
    { key: 'paymentAmount', label: '收款金额', required: true, type: 'number', description: '实际收款金额' },
    { key: 'paymentReceivedAt', label: '收款时间', required: true, type: 'datetime', description: '实际收款时间' },
  ],
  USER_REVIEW: [
    { key: 'rating', label: '评分', required: true, type: 'number', description: '1-5星' },
    { key: 'reviewComment', label: '评语', required: false, type: 'string', description: '评价补充内容' },
  ],
}
