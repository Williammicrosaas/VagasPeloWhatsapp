# Configuração do Stripe - Sprint 3.2

## 📋 Checklist de Configuração

### 1. Instalar Dependência
```bash
npm install stripe
# ou
pnpm add stripe
```

### 2. Criar Conta no Stripe
1. Acesse https://stripe.com
2. Crie uma conta (modo teste para desenvolvimento)
3. Obtenha suas chaves de API

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Stripe (OBRIGATÓRIO para pagamentos)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Use `.env.local` (não commitar no Git)
- Use chaves de teste (`sk_test_`) para desenvolvimento
- Use chaves de produção (`sk_live_`) apenas em produção

### 4. Criar Produtos e Preços no Stripe

#### Opção A: Criar Manualmente no Dashboard
1. Acesse https://dashboard.stripe.com/test/products
2. Crie produtos:
   - **Professional** (mensal e anual)
   - **Enterprise** (mensal e anual)
3. Copie os `price_id` de cada produto
4. Execute a migration SQL e atualize os planos:

```sql
-- Atualizar planos com price_ids do Stripe
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_xxx',
    stripe_price_id_yearly = 'price_yyy'
WHERE name = 'Professional';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_aaa',
    stripe_price_id_yearly = 'price_bbb'
WHERE name = 'Enterprise';
```

#### Opção B: Deixar o Sistema Criar Automaticamente
- O sistema criará produtos e preços automaticamente na primeira compra
- Os `price_id` serão salvos no banco automaticamente

### 5. Configurar Webhook do Stripe

1. Acesse https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint"
3. URL do endpoint: `https://seu-dominio.com/api/stripe/webhook`
4. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o "Signing secret" (começa com `whsec_`)
6. Adicione ao `.env.local` como `STRIPE_WEBHOOK_SECRET`

### 6. Executar Migrations SQL

Execute no Supabase SQL Editor:

```sql
-- Adicionar campos Stripe
scripts/10-add-stripe-fields.sql
```

## 🧪 Testar Integração

### Teste de Checkout:
1. Acesse `/pricing`
2. Selecione um plano pago
3. Clique em "Assinar Agora"
4. Use cartão de teste: `4242 4242 4242 4242`
5. Data: qualquer data futura
6. CVC: qualquer 3 dígitos

### Teste de Webhook (Local):
1. Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Copie o webhook secret gerado
3. Use em `STRIPE_WEBHOOK_SECRET` temporariamente

## 🔐 Segurança

### ✅ Boas Práticas:
- ✅ Nunca commitar chaves no Git
- ✅ Usar `.env.local` para desenvolvimento
- ✅ Configurar secrets no Vercel/plataforma de deploy
- ✅ Rotacionar chaves se vazarem
- ✅ Usar modo teste em desenvolvimento
- ✅ Verificar assinatura do webhook

### ❌ Nunca Fazer:
- ❌ Commitar `.env` ou `.env.local`
- ❌ Expor chaves no frontend
- ❌ Usar chaves de produção em desenvolvimento
- ❌ Ignorar verificação de webhook

## 📊 Fluxo Completo

1. **Usuário clica "Assinar Agora"**
   - Frontend chama `/api/stripe/checkout`
   - API cria sessão no Stripe
   - Retorna URL de checkout

2. **Usuário completa pagamento**
   - Stripe redireciona para `/dashboard?success=true`
   - Webhook recebe evento `checkout.session.completed`

3. **Webhook processa evento**
   - Cria/atualiza `user_subscriptions`
   - Cria `payment_transactions`
   - Ativa assinatura

4. **Usuário vê confirmação**
   - Página de sucesso mostra status
   - Dashboard atualiza com novo plano

## 🐛 Troubleshooting

### Erro: "Stripe não configurado"
- Verifique se `STRIPE_SECRET_KEY` está no `.env.local`
- Reinicie o servidor após adicionar variáveis

### Erro: "Webhook error"
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto
- Confirme que a URL do webhook está acessível
- Verifique eventos selecionados no Stripe

### Checkout não redireciona
- Verifique `NEXT_PUBLIC_SITE_URL` no `.env.local`
- Confirme que a URL está acessível

### Assinatura não é criada
- Verifique logs do webhook
- Confirme que metadata está sendo enviada
- Verifique políticas RLS no Supabase

## 📝 Próximos Passos

Após configurar:
1. Testar checkout completo
2. Verificar criação de assinaturas
3. Testar webhook com Stripe CLI
4. Configurar em produção

