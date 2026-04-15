import { cn } from '@/lib/utils'

interface BadgeProps {
  variant: 'pending' | 'assigned' | 'working' | 'settling' | 'completed' | 'available' | 'maintenance' | 'in_use'
  children: React.ReactNode
  className?: string
}

const variantMap: Record<BadgeProps['variant'], string> = {
  pending: 'status-pending',
  assigned: 'status-active',
  working: 'status-active',
  settling: 'status-pending',
  completed: 'status-success',
  available: 'status-success',
  maintenance: 'status-error',
  in_use: 'status-active',
}

const labelMap: Record<string, string> = {
  pending: '待分配',
  assigned: '已分配',
  working: '作业中',
  settling: '待结算',
  completed: '已完成',
  available: '可用',
  maintenance: '维修中',
  in_use: '使用中',
  unsettled: '未结算',
  settled: '已结算',
  archived: '已归档',
}

export function StatusBadge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn('status-badge', variantMap[variant], className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

export function getStatusLabel(status: string): string {
  return labelMap[status] || status
}
