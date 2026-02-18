'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, ReactNode } from 'react'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  MapPin,
  User,
  Stethoscope,
  Briefcase,
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { OnboardingModal } from '@/components/modals/OnboardingModal'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Unidades', href: '/dashboard/unidades', icon: MapPin },
  { name: 'Serviços', href: '/dashboard/servicos', icon: Stethoscope },
  { name: 'Profissionais', href: '/dashboard/profissionais', icon: Briefcase },
  { name: 'Equipe', href: '/dashboard/equipe', icon: Users },
  { name: 'Assinatura', href: '/dashboard/assinatura', icon: CreditCard },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  { name: 'Perfil', href: '/dashboard/perfil', icon: User },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { empresa, user, clear, setEmpresa, setEmpresaUsuario, setUser } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  // Carregar sessão ao montar componente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient()
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Carregar perfil do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            created_at: session.user.created_at || ''
          })

          // Carregar dados da empresa
          const { data: empresaUsuario, error: euError } = await supabase
            .from('empresa_usuarios')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (euError) {
            console.error('Erro ao carregar empresa_usuario:', euError)
          } else if (empresaUsuario) {
            setEmpresaUsuario(empresaUsuario)
            
            const { data: empresaData, error: empresaError } = await supabase
              .from('empresas')
              .select('*')
              .eq('id', empresaUsuario.empresa_id)
              .single()

            if (empresaError) {
              console.error('Erro ao carregar empresa:', empresaError)
            } else if (empresaData) {
              setEmpresa(empresaData)
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [setUser, setEmpresa, setEmpresaUsuario])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      clear()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Minha Saúde</span>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empresa Info */}
        {empresa && (
          <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
            <p className="text-xs font-medium text-primary-600">Empresa</p>
            <p className="text-sm font-semibold text-primary-900 mt-0.5 truncate">
              {empresa.nome_fantasia}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          {user && (
            <div className="mb-3 px-4">
              <p className="text-xs text-slate-500">Conectado como</p>
              <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-danger-600 hover:bg-danger-50 rounded-lg font-medium transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900">
              {navigation.find((item) => pathname.startsWith(item.href))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Placeholder para notificações, user menu etc */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container-custom py-8">
            {children}
          </div>
        </main>
      </div>
      
      <OnboardingModal />
    </div>
  )
}
