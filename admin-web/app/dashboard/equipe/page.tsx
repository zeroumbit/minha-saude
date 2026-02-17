'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Users, UserPlus, Mail, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EmpresaUsuario } from '@/lib/types/database'
import { useAuthStore } from '@/lib/stores/auth-store'

// Extensão do tipo para incluir dados do user (join)
interface EmpresaUsuarioComDetalhes extends EmpresaUsuario {
  users: {
    email: string
  } | null
}

export default function EquipePage() {
  const [membros, setMembros] = useState<EmpresaUsuarioComDetalhes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { empresa, user } = useAuthStore()

  useEffect(() => {
    loadEquipe()
  }, [empresa])

  const loadEquipe = async () => {
    if (!empresa) return

    try {
      const supabase = createClient()
      
      // Busca membros da empresa e seus emails da tabela auth.users (precisa de view ou RPC se não tiver acesso direto,
      // mas vamos assumir que a tabela empresa_usuarios tem o user_id e vamos tentar buscar o email.
      // Nota: O acesso direto a auth.users via client-side geralmente é bloqueado por segurança.
      // O ideal é ter uma view pública ou function secure.
      // Vou usar uma abordagem alternativa: listar apenas os registros da tabela empresa_usuarios por enquanto,
      // e assumir que talvez precisemos de uma RPC `get_empresa_members` no futuro.
      // POR AGORA: Vou tentar fazer o fetch simples e se falhar no email, mostro o ID ou "Usuário".
      
      const { data, error } = await supabase
        .from('empresa_usuarios')
        .select(`
          *,
          user:user_id (
            email
          )
        `) // Isso requer uma FK configurada corretamente e permissão de leitura.
           // Se user_id referencia auth.users, o PostgREST normalmente não deixa fazer join direto com auth.users por segurança.
           // O padrão é criar uma VIEW "public_profiles" ou similar.
           // Vou listar sem o email por enquanto se o join falhar, mas deixarei o código preparado.
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.warn('Erro ao carregar detalhes do usuário (possível restrição de segurança):', error)
        // Fallback: carregar apenas os dados da tabela de ligação
         const { data: simpleData, error: simpleError } = await supabase
            .from('empresa_usuarios')
            .select('*')
            .eq('empresa_id', empresa.id)
        
         if (simpleError) throw simpleError
         setMembros(simpleData as any)
      } else {
         // Mapear user.email se o join funcionou (o supabase retorna arrays ou objetos dependendo da relação)
         // O tipo retornado pelo supabase client precisa ser tratado
         const formattedData = data.map((item: any) => ({
             ...item,
             users: item.user // Renomeando para bater com a interface
         }))
         setMembros(formattedData)
      }

    } catch (error) {
      console.error('Erro ao carregar equipe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Badge variant="primary" className="bg-purple-100 text-purple-800 border-purple-200">Dono</Badge>
      case 'ADMIN':
        return <Badge variant="warning">Admin</Badge>
      case 'EDITOR':
        return <Badge variant="default">Editor</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Equipe</h1>
          <p className="text-slate-600 mt-1">
            Gerencie quem tem acesso à sua empresa
          </p>
        </div>

        <Button variant="primary" icon={<UserPlus className="w-5 h-5" />} disabled>
          Convidar Membro (Em breve)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros Ativos</CardTitle>
          <CardDescription>
            Lista de usuários com acesso ao painel da {empresa?.nome_fantasia}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
               <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : membros.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum membro encontrado.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {membros.map((membro) => (
                <div key={membro.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {membro.users?.email || 'Usuário do Sistema'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        ID: {membro.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getRoleBadge(membro.role)}
                    {/* Botões de ação (Editar/Remover) ficariam aqui */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900">Sobre convites</h4>
          <p className="text-sm text-blue-700 mt-1">
            Para adicionar novos membros, o sistema de convites por e-mail será ativado em breve.
            No momento, apenas o criador da conta tem acesso.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
