type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    primary: 'badge-primary',
    default: 'bg-slate-100 text-slate-800',
  }

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Status Helpers
export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: BadgeVariant; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Ativo' },
    INACTIVE: { variant: 'default', label: 'Inativo' },
    SUSPENDED: { variant: 'warning', label: 'Suspenso' },
    BLOCKED_ADMIN: { variant: 'danger', label: 'Bloqueado' },
    CANCELLED: { variant: 'danger', label: 'Cancelado' },
    TRIAL: { variant: 'primary', label: 'Trial' },
    PAST_DUE: { variant: 'warning', label: 'Vencido' },
    CANCELED: { variant: 'danger', label: 'Cancelado' },
    PAUSED: { variant: 'warning', label: 'Pausado' },
    OPEN: { variant: 'warning', label: 'Em aberto' },
    PAID: { variant: 'success', label: 'Pago' },
    VOID: { variant: 'default', label: 'Anulado' },
    UNCOLLECTIBLE: { variant: 'danger', label: 'Não cobrável' },
    PENDING: { variant: 'warning', label: 'Pendente' },
    SUCCEEDED: { variant: 'success', label: 'Sucesso' },
    FAILED: { variant: 'danger', label: 'Falhou' },
    REFUNDED: { variant: 'default', label: 'Reembolsado' },
  }

  const config = statusMap[status] || { variant: 'default' as BadgeVariant, label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
