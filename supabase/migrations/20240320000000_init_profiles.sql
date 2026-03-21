-- Run Quest - Migração inicial (profiles)
-- Execute este SQL no Supabase: SQL Editor -> New query -> Cole e execute

-- 1. Tabela profiles (compatível com o app mobile)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Índice para busca por user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 3. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Usuários autenticados podem ler seu próprio perfil
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Apenas o trigger insere (não permitir insert manual para evitar duplicatas)
CREATE POLICY "Allow insert for authenticated"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Função para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nickname, level, xp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    1,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger: cria profile quando novo usuário se cadastra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. (Opcional) Criar profiles para usuários que já existem em auth.users mas não têm profile
INSERT INTO public.profiles (user_id, nickname, level, xp)
SELECT id, COALESCE(raw_user_meta_data->>'nickname', split_part(email, '@', 1)), 1, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;
