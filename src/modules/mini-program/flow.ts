import { ORDER_NODE_FLOW, ROLE_PERMISSION_MATRIX } from './constants'
import type { MiniProgramRole, OrderNodeCode } from './types'

export function getAllowedNodeActionsByRole(role: MiniProgramRole): OrderNodeCode[] {
  const roleConfig = ROLE_PERMISSION_MATRIX.find(item => item.role === role)
  return roleConfig?.allowedNodeActions ?? []
}

export function isRoleAllowedToOperateNode(role: MiniProgramRole, node: OrderNodeCode): boolean {
  return getAllowedNodeActionsByRole(role).includes(node)
}

export function getNodeTimeoutRule(node: OrderNodeCode): { timeoutHours?: number; autoCloseOnTimeout?: boolean } {
  const found = ORDER_NODE_FLOW.find(item => item.code === node)
  return {
    timeoutHours: found?.timeoutHours,
    autoCloseOnTimeout: found?.autoCloseOnTimeout,
  }
}

export function validateNegotiationRoundCount(roundCount: number): boolean {
  return roundCount >= 0 && roundCount <= 3
}

export function getNextNode(currentNode: OrderNodeCode): OrderNodeCode | null {
  const idx = ORDER_NODE_FLOW.findIndex(item => item.code === currentNode)
  if (idx < 0 || idx === ORDER_NODE_FLOW.length - 1) {
    return null
  }
  return ORDER_NODE_FLOW[idx + 1].code
}
