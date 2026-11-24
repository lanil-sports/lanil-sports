-- Add structured game log storage for athlete profiles
alter table public.athletes
  add column if not exists game_logs jsonb not null default '[]'::jsonb,
  add column if not exists season_highs jsonb not null default '{}'::jsonb;

comment on column public.athletes.game_logs is 'Verified game-by-game box scores/logs for display in athlete profile.';
comment on column public.athletes.season_highs is 'Verified season highs/summary stats extracted from source profiles.';
