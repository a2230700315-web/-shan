import { useUserWeb } from '../state/UserWebStore'

export function UserWebToast() {
  const { toast } = useUserWeb()
  if (!toast) return null

  const bgMap = {
    success: 'bg-success/90',
    error: 'bg-destructive/90',
    info: 'bg-accent/90',
  } as const

  return (
    <div className="fixed top-24 right-6 z-[9998] animate-slide-in-right">
      <div className={`${bgMap[toast.type]} text-primary-foreground px-6 py-3 rounded-2xl shadow-glow backdrop-blur-sm font-medium`}>
        {toast.message}
      </div>
    </div>
  )
}

