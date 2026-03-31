-- Align expiration logic with requirements:
-- mark orders as expired when older than TTL and status NOT IN ('completed', 'cancelled').

create or replace function public.expire_orders(ttl_minutes integer default 30)
returns integer
language plpgsql
security definer
as $$
declare
  cutoff timestamptz := now() - (ttl_minutes || ' minutes')::interval;
  updated_count integer := 0;
begin
  update orders
  set status = 'expired'
  where created_at < cutoff
    and coalesce(lower(status), '') not in ('completed', 'cancelled', 'expired');

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

