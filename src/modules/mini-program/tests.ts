import { MESSAGE_TEMPLATES, MINI_PROGRAM_PAGES, ORDER_NODE_FLOW, ROLE_PERMISSION_MATRIX } from './constants'
import { DEMAND_FORM_FIELDS, NODE_ACTION_FIELDS } from './fieldDictionary'
import { getAllowedNodeActionsByRole, getNextNode, getNodeTimeoutRule, isRoleAllowedToOperateNode, validateNegotiationRoundCount } from './flow'

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

function runMiniProgramContractTests(): void {
  // 1) 必须覆盖10个节点
  assert(ORDER_NODE_FLOW.length === 10, '节点数量必须为10')

  // 2) 服务商端关键节点必须可操作
  assert(
    isRoleAllowedToOperateNode('ground_crew', 'DEPART_TO_SITE'),
    '地勤必须可执行“前往吊运地点”节点',
  )
  assert(
    isRoleAllowedToOperateNode('pilot', 'START_LIFTING') && isRoleAllowedToOperateNode('pilot', 'FINISH_LIFTING'),
    '飞手必须可执行“开始吊运/吊运结束”节点',
  )
  assert(
    isRoleAllowedToOperateNode('finance', 'ISSUE_INVOICE'),
    '财务必须可执行“开具发票”节点',
  )

  // 3) 超时规则必须存在（接单2小时，确认报价24小时）
  const acceptTimeout = getNodeTimeoutRule('PROVIDER_ACCEPT')
  const quoteConfirmTimeout = getNodeTimeoutRule('USER_CONFIRM_QUOTE')
  assert(acceptTimeout.timeoutHours === 2 && acceptTimeout.autoCloseOnTimeout === true, '接单超时规则错误')
  assert(quoteConfirmTimeout.timeoutHours === 24 && quoteConfirmTimeout.autoCloseOnTimeout === true, '用户确认报价超时规则错误')

  // 4) 议价轮次最多3轮
  assert(validateNegotiationRoundCount(0), '议价轮次0应合法')
  assert(validateNegotiationRoundCount(3), '议价轮次3应合法')
  assert(!validateNegotiationRoundCount(4), '议价轮次4应非法')

  // 5) 页面结构完整性：用户端+服务商端页面都要有
  const userPages = MINI_PROGRAM_PAGES.filter(page => page.portal === 'user')
  const providerPages = MINI_PROGRAM_PAGES.filter(page => page.portal === 'provider')
  assert(userPages.length > 0, '必须定义用户端页面')
  assert(providerPages.length > 0, '必须定义服务商端页面')

  // 6) 消息模板必须覆盖关键触发节点
  const triggers = new Set(MESSAGE_TEMPLATES.map(item => item.triggerNode))
  assert(triggers.has('PROVIDER_QUOTE'), '消息模板缺少“服务商报价”通知')
  assert(triggers.has('DEPART_TO_SITE'), '消息模板缺少“前往吊运地点”通知')
  assert(triggers.has('FINISH_LIFTING'), '消息模板缺少“吊运结束”通知')
  assert(triggers.has('ISSUE_INVOICE'), '消息模板缺少“开具发票”通知')

  // 7) 角色矩阵完整性
  const roles = ROLE_PERMISSION_MATRIX.map(item => item.role)
  assert(roles.includes('customer_service'), '权限矩阵缺少客服角色')
  assert(roles.includes('ground_crew'), '权限矩阵缺少地勤角色')
  assert(roles.includes('pilot'), '权限矩阵缺少飞手角色')
  assert(roles.includes('finance'), '权限矩阵缺少财务角色')

  // 8) 节点推进有效性
  assert(getNextNode('SUBMIT_DEMAND') === 'PROVIDER_ACCEPT', '节点推进顺序错误（提交需求->服务商接单）')
  assert(getNextNode('ISSUE_INVOICE') === 'USER_REVIEW', '节点推进顺序错误（开具发票->评价服务）')
  assert(getNextNode('USER_REVIEW') === null, '最后节点后续应为空')

  // 9) 管理员应具备全服务商节点权限
  const adminActions = getAllowedNodeActionsByRole('provider_admin')
  const requiredProviderNodes = ['PROVIDER_ACCEPT', 'PROVIDER_QUOTE', 'RESOURCE_ASSIGN', 'DEPART_TO_SITE', 'START_LIFTING', 'FINISH_LIFTING', 'ISSUE_INVOICE']
  assert(requiredProviderNodes.every(node => adminActions.includes(node as never)), '管理员服务商节点权限不完整')

  // 10) 字段字典完整性
  assert(DEMAND_FORM_FIELDS.length >= 11, '发布需求字段定义不完整')
  assert(DEMAND_FORM_FIELDS.some(field => field.key === 'pickupAddress' && field.required), '缺少必填起始点地址字段')
  assert(DEMAND_FORM_FIELDS.some(field => field.key === 'contactPhone' && field.type === 'phone'), '缺少联系电话字段或类型错误')

  assert(NODE_ACTION_FIELDS.DEPART_TO_SITE.some(field => field.key === 'departedAt'), '前往吊运地点节点缺少出发时间字段')
  assert(NODE_ACTION_FIELDS.START_LIFTING.some(field => field.key === 'startedAt'), '开始吊运节点缺少开始时间字段')
  assert(NODE_ACTION_FIELDS.FINISH_LIFTING.some(field => field.key === 'actualAmount'), '吊运结束节点缺少实际金额字段')
  assert(NODE_ACTION_FIELDS.ISSUE_INVOICE.some(field => field.key === 'invoiceNo'), '开具发票节点缺少发票号码字段')
  assert(NODE_ACTION_FIELDS.ISSUE_INVOICE.some(field => field.key === 'paymentAmount'), '开具发票节点缺少收款金额字段')
}

runMiniProgramContractTests()

export {}
