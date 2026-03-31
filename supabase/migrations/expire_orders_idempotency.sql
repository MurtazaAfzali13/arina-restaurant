-- Adds server-side order expiration + idempotency hardening.

-- 1) Idempotency: store an idempotency key per order insert to prevent duplicates.
alter table if exists orders
  add column if not exists idempotency_key text;

create unique index if not exists orders_idempotency_key_unique
  on orders (idempotency_key)
  where idempotency_key is not null;

-- 2) Expiration: mark old non-final orders as expired.
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
    and coalesce(lower(status), '') not in ('completed', 'cancelled', 'delivered', 'expired');

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- 3) Optional: schedule the job automatically if pg_cron is available.
do $$
begin
  -- Best-effort; ignore if pg_cron isn't installed/enabled in this project.
  begin
    create extension if not exists pg_cron;
  exception
    when others then null;
  end;

  begin
    -- Run every minute.
    perform cron.schedule(
      'expire_orders_job',
      '* * * * *',
      $$select public.expire_orders();$$
    );
  exception
    when others then null;
  end;
end $$;

