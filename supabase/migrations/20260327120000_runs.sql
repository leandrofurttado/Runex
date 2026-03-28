-- Histórico de corridas por usuário (distância, tempo, rota opcional)
-- Execute no Supabase SQL Editor ou via pipeline de migrações.

CREATE TABLE IF NOT EXISTS public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distance_meters NUMERIC(12, 2) NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  route_geojson JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_runs_user_started ON public.runs (user_id, started_at DESC);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own runs"
  ON public.runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own runs"
  ON public.runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own runs"
  ON public.runs FOR DELETE
  USING (auth.uid() = user_id);
