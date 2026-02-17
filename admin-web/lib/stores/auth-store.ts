import { create } from 'zustand'
import { Empresa, EmpresaUsuario, EmpresaUserRole } from '@/lib/types/database'

interface User {
  id: string
  email: string
  created_at: string
}

interface AuthStore {
  user: User | null
  empresa: Empresa | null
  empresaUsuario: EmpresaUsuario | null
  role: EmpresaUserRole | null
  isAdmin: boolean
  
  setUser: (user: User | null) => void
  setEmpresa: (empresa: Empresa | null) => void
  setEmpresaUsuario: (empresaUsuario: EmpresaUsuario | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  empresa: null,
  empresaUsuario: null,
  role: null,
  isAdmin: false,

  setUser: (user) => set({ user }),
  
  setEmpresa: (empresa) => set({ empresa }),
  
  setEmpresaUsuario: (empresaUsuario) => 
    set({ 
      empresaUsuario,
      role: empresaUsuario?.role || null,
      isAdmin: empresaUsuario?.role === 'OWNER' || empresaUsuario?.role === 'ADMIN'
    }),
  
  clear: () => set({ 
    user: null, 
    empresa: null, 
    empresaUsuario: null,
    role: null,
    isAdmin: false
  }),
}))
