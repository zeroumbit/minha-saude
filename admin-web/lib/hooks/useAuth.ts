'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'

export function useAuth() {
  const { user, setUser, empresa, setEmpresa, setEmpresaUsuario } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Carregar sessão inicial
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at || ''
          })

          // Carregar dados da empresa
          const { data: empresaUsuario } = await supabase
            .from('empresa_usuarios')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (empresaUsuario) {
            setEmpresaUsuario(empresaUsuario)

            const { data: empresaData } = await supabase
              .from('empresas')
              .select('*')
              .eq('id', empresaUsuario.empresa_id)
              .single()

            if (empresaData) {
              setEmpresa(empresaData)
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()

    // Ouvir mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || ''
        })

        // Carregar dados da empresa
        const { data: empresaUsuario } = await supabase
          .from('empresa_usuarios')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (empresaUsuario) {
          setEmpresaUsuario(empresaUsuario)

          const { data: empresaData } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', empresaUsuario.empresa_id)
            .single()

          if (empresaData) {
            setEmpresa(empresaData)
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setEmpresa(null)
        setEmpresaUsuario(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setEmpresa, setEmpresaUsuario])

  return { user, empresa, isLoading }
}
