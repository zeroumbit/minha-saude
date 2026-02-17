import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MapPin, Users, Eye, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  // TODO: Buscar dados reais do Supabase
  const stats = [
    {
      title: 'Unidades Ativas',
      value: '0',
      icon: MapPin,
      trend: '+0%',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Visualizações (mês)',
      value: '0',
      icon: Eye,
      trend: '+0%',
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      title: 'Membros da Equipe',
      value: '1',
      icon: Users,
      trend: '—',
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      title: 'Taxa de Conversão',
      value: '0%',
      icon: TrendingUp,
      trend: '0%',
      color: 'text-danger-600',
      bgColor: 'bg-danger-100',
    },
  ]

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="mb-8 p-8 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-2">Bem-vindo de volta! 👋</h2>
        <p className="text-primary-100">
          Gerencie suas unidades e acompanhe o desempenho dos seus anúncios
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} opacity-10 rounded-full -mr-16 -mt-16`} />
              
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`text-sm font-medium mt-2 ${stat.trend.startsWith('+') ? 'text-success-600' : 'text-slate-500'}`}>
                      {stat.trend} vs mês anterior
                    </p>
                  </div>
                  
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <p className="font-medium text-primary-900">➕ Adicionar Nova Unidade</p>
                <p className="text-sm text-primary-600">Expandir sua presença no app</p>
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <p className="font-medium text-slate-900">👥 Convidar Membro da Equipe</p>
                <p className="text-sm text-slate-600">Gerenciar colaboradores</p>
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <p className="font-medium text-slate-900">⚙️ Configurar Especialidades</p>
                <p className="text-sm text-slate-600">Atualizar serviços oferecidos</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-slate-500">Nenhuma atividade recente</p>
              <p className="text-sm text-slate-400 mt-2">
                Comece adicionando sua primeira unidade
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
