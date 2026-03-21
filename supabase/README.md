# Setup do Supabase para Run Quest

## Rodar migração via script

1. Adicione no `.env`:
   ```
   SUPABASE_DB_PASSWORD=sua_senha_do_postgres
   ```
   A senha está em: [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto → **Settings** → **Database** → Connection string (copie a senha)

2. Execute:
   ```bash
   npm run db:migrate
   ```

---

# Setup do Supabase para Run Quest (manual)

Este projeto veio do Lovable (versão web). Siga os passos abaixo para configurar o Supabase corretamente.

---

## 1. Corrigir a chave no .env

**Problema:** O app usa a chave **secreta** (`sb_secret_...`) no lugar da chave **pública** (`sb_publishable_...`).

- A chave `sb_secret_*` é para backend e **não funciona em apps clientes** (retorna 401).
- Para o app mobile, use a chave **publishable** ou a **anon** (legacy).

**Como corrigir:**

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto
2. Vá em **Settings** → **API** (ou **Project Settings** → **API**)
3. Copie a chave **anon** (JWT `eyJ...`) **ou** a **publishable** (`sb_publishable_...`)
4. No `.env`, substitua:

```
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_ou_publishable_aqui
```

> ⚠️ Nunca use `sb_secret_` ou `service_role` no app — essas chaves dão acesso total e devem ficar só no backend.

---

## 2. Criar as tabelas no Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto
2. Vá em **SQL Editor** → **New query**
3. Cole o conteúdo do arquivo `migrations/001_init_profiles.sql`
4. Clique em **Run**

Isso vai criar:
- Tabela `profiles` (user_id, nickname, avatar_url, level, xp)
- Trigger para criar perfil automaticamente no cadastro
- Políticas RLS
- Migração de usuários já existentes

---

## 3. (Opcional) Confirmar email desabilitado para desenvolvimento

Se quiser testar login sem confirmar email:
1. **Authentication** → **Providers** → **Email**
2. Desative **Confirm email**

---

## 4. Verificar

- Faça cadastro no app
- Confira em **Table Editor** → **profiles** se o perfil foi criado
- Faça login com o mesmo email/senha
