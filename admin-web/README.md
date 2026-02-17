# Admin Web - Minha Saúde

Plataforma administrativa para anunciantes gerenciarem suas unidades e planos.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Design System Customizado
- **Backend/Auth:** Supabase
- **Icons:** Lucide React

## Setup

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente em `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

3. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura
- `/app`: Rotas e páginas (Dashboard, Login, Cadastro)
- `/components`: Componentes reutilizáveis (UI, Layouts)
- `/lib`: Configurações (Supabase, Stores, Types)
