# Fluxos de Usuário - BuscaVagasWhats

## Onboarding Ideal (Novos Usuários)

### Objetivo
Converter visitante → usuário ativo em <15 minutos, com compreensão clara do valor.

---

### Passo 1: Landing Page + CTA
**Ação do Usuário:** Clica em "Comece Agora Gratuitamente"

**Interface:**
- Hero com benefício principal: "Receba vagas de emprego no WhatsApp"
- 3 features em destaque: Rápido, Direto, Global
- Estatísticas de prova social: "10k+ vagas", "5k+ contratados"
- Botão CTA destacado

**Duração:** < 1 min

---

### Passo 2: Sign-Up com Email
**Ação do Usuário:** Preenche email e cria senha

**Interface:**
- Formulário simples: email, senha, confirmar senha
- Validação em tempo real
- Link "Já tem conta? Faça login"
- Checkbox: "Concordo com Termos e Privacidade"

**Backend:**
- Enviar email de confirmação com link
- Link redireciona para `/auth/login` (não Vercel)
- Incluir mensagem: "Confirme seu email para continuar"

**Duração:** 2 min

---

### Passo 3: Confirmação de Email + Login
**Ação do Usuário:** Clica no link do email e faz login

**Interface:**
- Página de sucesso: "Email confirmado! 🎉"
- Botão: "Continuar para Dashboard"
- Redireciona automático após 3 segundos

**Backend:**
- Marcar email como confirmado no Supabase
- Criar sessão de usuário
- Redirect para dashboard

**Duração:** 1 min

---

### Passo 4: Onboarding Guiado no Dashboard
**Ação do Usuário:** Vê visual de progresso (5 passos) e preenche informações

**Interface:**
- Progress bar: "Passo 1 de 5"
- Cards com instruções claras
- Inputs: Nome, Profissão/Área, Localização
- Botão: "Próximo"

**Passos:**
1. **Perfil Básico** → Nome, Profissão, Localização
2. **Preferências** → Área de trabalho, Nível, Tipo (CLT/PJ), Modalidade
3. **WhatsApp** → Número + confirmação
4. **Primeira Busca** → Modal "Encontre seu Emprego" preenchido parcialmente
5. **Sucesso!** → Mensagem de boas-vindas + "Vagas chegando em breve"

**Backend:**
- Salvar dados em `users` e `job_preferences` tabelas
- Enviar mensagem WhatsApp de confirmação
- Disparar N8N para primeira busca

**Duração:** 5-10 min

---

### Passo 5: Confirmação via WhatsApp
**Ação do Usuário:** Recebe mensagem de boas-vindas no WhatsApp

**Mensagem WhatsApp:**
\`\`\`
🎉 Bem-vindo à BuscaVagasWhats!

Seu perfil foi criado com sucesso. Agora você vai receber
vagas de emprego selecionadas diretamente aqui.

Sua primeira busca foi enviada. Fique atento! 👀

Comandos disponíveis:
/minhas_vagas - Ver vagas recentes
/favoritas - Ver favoritos
/parar - Desativar notificações
/ajuda - Ver mais opções

Qualquer dúvida, estamos aqui para ajudar!
\`\`\`

**Duração:** Imediato

---

## Fluxo de Uso Recorrente (Usuários Ativos)

### Objetivo
Usuário recebe vaga relevante → interage → gerencia histórico → deixa feedback.

---

### Etapa 1: Receber Vaga
**Quando:** Novo match encontrado (verificado a cada hora)

**Notificação WhatsApp:**
\`\`\`
📌 Nova Oportunidade!

💼 Desenvolvedor Full Stack
🏢 XYZ Tecnologia
📍 São Paulo, SP (Remoto)
💰 R$ 8-12k

✨ Match: 92% (Muito Compatível!)

👉 [Ver Detalhes]
👍 [Candidatar Agora]
⭐ [Favoritar]
\`\`\`

**Backend:**
- Query em vagas_candidatos com match score
- Se score > 80%, enviar notificação prioritária
- Registrar em sent_jobs para histórico

---

### Etapa 2: Visualizar Detalhes
**Ação:** Usuário clica em "Ver Detalhes" ou "Candidatar Agora"

**Interface (no app ou web):**
- Card grande com informações completas
- Campos: Cargo, Empresa, Localização, Tipo, Salário, Descrição, Requisitos
- Botões de ação: Candidatar, Favoritar, Ignor ar

**Duração:** 1-3 min

---

### Etapa 3: Interagir
**Opções de Ação:**

#### 3a. Candidatar
- Botão "Candidatar Agora" no WhatsApp ou app
- Marca em `sent_jobs` como `applied`
- Envia resposta: "Candidatura enviada! Boa sorte! 🚀"
- Registra timestamp

#### 3b. Favoritar
- Botão "Salvar Favorita"
- Marca em `sent_jobs` como `favorited`
- Envia resposta: "Vaga favoritada! ⭐"
- Permite ver depois no histórico

#### 3c. Ignorar
- Botão "Não me interessa" ou "Ignorar"
- Marca em `sent_jobs` como `dismissed`
- Envia resposta: "Entendido, não enviaremos vagas similares"

#### 3d. Marcar como Visto
- Marca em `sent_jobs` como `viewed`
- Ajuda no matching (histórico de interesse)

---

### Etapa 4: Enviar Feedback (Opcional)
**Interface:** Modal ou comando no WhatsApp

**Campos:**
- Rating: 1-5 estrelas
- Qualidade: "Vaga válida", "Vaga expirada", "Spam", "Não me interessa", "Muito boa!"
- Comentário opcional (texto)

**Backend:**
- Salvar em `job_feedback` tabela
- Usar para melhorar scoring futuro
- Mostrar "Feedback enviado, obrigado!"

**Duração:** <1 min

---

### Etapa 5: Gerenciar Histórico
**Acesso:** Dashboard → "Histórico de Vagas"

**Interface:**
- Tabela com últimas vagas recebidas
- Colunas: Data, Cargo, Empresa, Ação (Candidatar/Favoritar), Status
- Filtros: Data, Empresa, Área, Status
- Busca por texto

**Ações Possíveis:**
- Filtrar por data: "Últimos 7 dias", "Último mês", "Todos"
- Filtrar por status: "Vistas", "Candidatadas", "Favoritadas", "Ignoradas"
- Buscar por empresa ou cargo
- Candidatar em uma vaga antiga

**Duração:** 2-5 min

---

## Jornada Semanal Esperada

\`\`\`
Seg: Usuário recebe 3-5 vagas no WhatsApp
Ter: Usuário candidata em 2 vagas, favorita 1
Qua: Recebe feedback de uma candidatura
Qui: Acessa dashboard para ver histórico
Sex: Envia feedback em 2 vagas
Sab/Dom: Check ocasional de favoritos
\`\`\`

---

## Indicadores de Engagement

| Métrica | Alvo | Frequência |
|---------|------|-----------|
| Vagas clicadas / enviadas | 30-40% | Diário |
| Taxa de candidaturas | 15-25% | Semanal |
| Feedback enviado | 20-30% | Semanal |
| Retorno ao dashboard | 2-3x / semana | Semanal |
| Interação no WhatsApp | Daily | Diário |

---

## Retenção e Re-engagement

### Sinais de Churn
- Usuário não clica em vagas por 1 semana
- Não candidata por 2 semanas
- Não acessa dashboard por 1 mês

### Ações de Re-engagement
- Email: "Você tem 5 novas vagas esperando!"
- WhatsApp: "Opa! Temos uma vaga perfeita para você..."
- Incentivo: "Ganhe badge 'Candidato Ativo' se candidatar em 2 vagas esta semana"
- Upgrade: "Considere Premium para filtros avançados"

---

## Fluxo de Upgrade para Premium

### Gatilhos de Upsell
1. Usuário é muito ativo (3+ candidaturas/semana) → Oferecer Premium
2. Usuário tem perfil 100% completo → Sugerir filtros avançados
3. Usuário favorita muitas vagas → "Salarve automaticamente com Premium"

### CTA Contextual
- "Ative filtro de salário mínimo (Premium)"
- "Receba alertas prioritários para vagas 90%+ relevantes (Premium)"
- "Suporte 24/7 e consultoria de CV (Premium)"

### Duração de Trial
- 7 dias grátis com todas as features Premium
- Email no dia 3: "Temos X vagas premium para você"
- Email no dia 6: "Seu trial acaba em 1 dia"
- Email no dia 8: "Volte ao plano gratuito ou assine Premium"

\`\`\`
