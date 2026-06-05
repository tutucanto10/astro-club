# ASTRO E-Commerce

E-commerce premium para a marca ASTRO Streetwear, desenvolvido com Next.js 15, TypeScript, Prisma, e integrações com Stripe e Mercado Pago.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| ORM | Prisma |
| Banco de Dados | PostgreSQL (Neon) |
| Autenticação | NextAuth.js v4 |
| Pagamentos | Stripe + Mercado Pago |
| Imagens | Cloudinary |
| Deploy | Vercel |
| DNS | Cloudflare |

---

## Estrutura de pastas

```
astro-ecommerce/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                # Dados iniciais
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login e cadastro (sem header/footer)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (store)/           # Loja pública (com header/footer)
│   │   │   ├── page.tsx       # Home
│   │   │   ├── about/         # Sobre nós
│   │   │   ├── checkout/      # Checkout
│   │   │   └── products/      # Catálogo e produto individual
│   │   ├── admin/             # Painel administrativo
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   └── coupons/
│   │   └── api/               # API Routes
│   │       ├── auth/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── coupons/
│   │       ├── payments/
│   │       ├── upload/
│   │       └── webhooks/
│   ├── components/
│   │   ├── admin/             # Componentes do painel admin
│   │   ├── cart/              # Carrinho (drawer)
│   │   ├── layout/            # Header, Footer, Providers
│   │   ├── product/           # Cards, filtros, página do produto
│   │   └── ui/                # Componentes base (toaster, skeleton)
│   ├── hooks/
│   │   ├── useCart.ts         # Zustand store do carrinho
│   │   └── use-toast.ts       # Sistema de notificações
│   ├── lib/
│   │   ├── auth.ts            # Configuração NextAuth
│   │   ├── prisma.ts          # Cliente Prisma (singleton)
│   │   └── utils.ts           # Utilitários
│   ├── middleware.ts           # Proteção de rotas
│   └── types/
│       └── next-auth.d.ts     # Tipos da sessão
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## Setup local

### 1. Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Neon (PostgreSQL)
- Conta Cloudinary
- Conta Stripe
- Conta Mercado Pago

### 2. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/astro-ecommerce.git
cd astro-ecommerce
npm install
```

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha todas as variáveis no arquivo `.env`:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="TEST-..."
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="TEST-..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# Admin
ADMIN_EMAIL="admin@astrobrand.com"
```

### 4. Banco de dados

```bash
# Criar as tabelas
npm run db:push

# Popular com dados iniciais (categorias, produtos, cupom)
npm run db:seed
```

Credenciais do admin após o seed:
- Email: `admin@astrobrand.com` (ou o ADMIN_EMAIL configurado)
- Senha: `admin123`

> **Importante:** Mude a senha do admin após o primeiro login em produção.

### 5. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Deploy na Vercel

### 1. Conectar repositório

1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório

### 2. Configurar variáveis de ambiente

No painel da Vercel, adicione todas as variáveis do `.env.example` com os valores de produção.

### 3. Configurar banco de dados (Neon)

1. Acesse [neon.tech](https://neon.tech)
2. Crie um projeto
3. Copie as URLs de conexão para as variáveis `DATABASE_URL` e `DIRECT_URL`

### 4. Build command

O `vercel.json` já configura o build command como:
```
prisma generate && next build
```

### 5. Domínio personalizado (Cloudflare + Vercel)

1. No Vercel: Adicione o domínio em Settings > Domains
2. No Cloudflare: Adicione os registros DNS indicados pela Vercel
3. Desative o proxy Cloudflare (ícone laranja → cinza) para o CNAME da Vercel
4. Aguarde a propagação (até 24h)

---

## Webhooks em produção

### Stripe

```bash
# Instalar Stripe CLI
stripe login
stripe listen --forward-to https://seudominio.com/api/webhooks/stripe
```

No painel Stripe: Webhooks > Add endpoint
- URL: `https://seudominio.com/api/webhooks/stripe`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Mercado Pago

No painel MP: Configurações > Webhooks
- URL: `https://seudominio.com/api/webhooks/mercado-pago`
- Tipo: `payment`

---

## Comandos úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar em produção
npm run db:push      # Sincronizar schema (sem migrations)
npm run db:migrate   # Criar migration
npm run db:generate  # Regenerar Prisma Client
npm run db:studio    # Prisma Studio (interface visual do banco)
npm run db:seed      # Popular banco com dados iniciais
npm run lint         # Verificar código
```

---

## Páginas e rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/products` | Catálogo completo |
| `/products?category=camisas` | Filtro por categoria |
| `/products/[slug]` | Página do produto |
| `/checkout` | Checkout |
| `/about` | Sobre a marca |
| `/login` | Login |
| `/register` | Cadastro |
| `/admin` | Painel admin (redirect) |
| `/admin/dashboard` | Dashboard |
| `/admin/products` | Lista de produtos |
| `/admin/products/new` | Novo produto |
| `/admin/products/[id]` | Editar produto |
| `/admin/orders` | Lista de pedidos |
| `/admin/customers` | Lista de clientes |
| `/admin/coupons` | Cupons de desconto |

---

## API Routes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastro de usuário |
| GET | `/api/products` | Listar produtos |
| POST | `/api/products` | Criar produto (admin) |
| PATCH | `/api/products/[id]` | Atualizar produto (admin) |
| DELETE | `/api/products/[id]` | Desativar produto (admin) |
| GET | `/api/orders` | Listar pedidos (admin) |
| POST | `/api/orders` | Criar pedido |
| PATCH | `/api/orders/[id]` | Atualizar status (admin) |
| GET | `/api/coupons` | Listar cupons (admin) |
| POST | `/api/coupons` | Criar cupom (admin) |
| DELETE | `/api/coupons/[id]` | Deletar cupom (admin) |
| POST | `/api/coupons/validate` | Validar cupom |
| POST | `/api/upload` | Upload de imagem (admin) |
| POST | `/api/payments/stripe` | Criar PaymentIntent |
| POST | `/api/payments/mercadopago` | Criar Preference MP |
| POST | `/api/webhooks/stripe` | Webhook Stripe |
| POST | `/api/webhooks/mercado-pago` | Webhook Mercado Pago |

---

## Funcionalidades

### Loja
- ✅ Catálogo com filtros (categoria, tamanho, preço, ordenação)
- ✅ Página de produto com galeria de imagens
- ✅ Seleção de tamanho com validação de estoque
- ✅ Carrinho persistente (Zustand + localStorage)
- ✅ Drawer de carrinho com quantidade e remoção
- ✅ Checkout completo com validação
- ✅ Múltiplas formas de pagamento (Pix, Cartão, Boleto)

### Admin
- ✅ Dashboard com métricas de vendas
- ✅ CRUD completo de produtos
- ✅ Upload de imagens via Cloudinary
- ✅ Gestão de variantes e estoque
- ✅ Lista e atualização de pedidos
- ✅ Lista de clientes
- ✅ Criação e gestão de cupons

### Técnico
- ✅ Autenticação com NextAuth (credentials)
- ✅ Proteção de rotas via middleware
- ✅ Integração Stripe com webhooks
- ✅ Integração Mercado Pago com webhooks
- ✅ SEO com metadata dinâmica e sitemap
- ✅ Server Components para performance
- ✅ Design responsivo (mobile-first)

---

## Design

A identidade visual da ASTRO é baseada em:
- **Paleta:** Preto, branco e tons de cinza
- **Tipografia display:** Bebas Neue (headings e logo)
- **Tipografia corpo:** DM Sans (textos e interface)
- **Estética:** Minimalista, clean, streetwear moderno
- **Raio de borda:** 0px (angular, geométrico)
- **Espaçamento:** Generoso, "ar" entre elementos

---

## Licença

Propriedade de Astro Brand. Todos os direitos reservados.
