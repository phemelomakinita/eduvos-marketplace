alter table public.events
  add column if not exists entry_fee numeric(10, 2)
  check (entry_fee is null or entry_fee >= 0);
