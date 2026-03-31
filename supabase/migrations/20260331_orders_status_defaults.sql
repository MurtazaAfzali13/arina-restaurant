-- Ensure orders.status exists and defaults to pending.
alter table if exists public.orders
  add column if not exists status text;

alter table if exists public.orders
  alter column status set default 'pending';

update public.orders
set status = 'pending'
where status is null;
