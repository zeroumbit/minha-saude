'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, empresa, setEmpresa, setEmpresaUsuario } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const loadEmpresaData = async () => {
      // Se já tem empresa carregada, não precisa recarregar
      if (empresa) return
      
      // Se não tem usuário, redireciona para login
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const supabase = createClient()
        
        // Carregar vínculo do usuário com a empresa
        const { data: empresaUsuario, error: euError } = await supabase
          .from('empresa_usuarios')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (euError) {
          console.error('Erro ao carregar empresa_usuario:', euError)
          return
        }

        if (empresaUsuario) {
          setEmpresaUsuario(empresaUsuario)
          
          // Carregar dados da empresa
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
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error)
      }
    }

    loadEmpresaData()
  }, [user, empresa, setEmpresa, setEmpresaUsuario, router])

  return <>{children}</>
}
