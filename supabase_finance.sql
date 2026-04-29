-- ============================================================
--  FINANCE APP — Supabase Migration
--  Includes: Schema, RLS, Indexes, Seed Data
--  Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";


-- ============================================================
-- 1. ENUMS
-- ============================================================
create type account_type      as enum ('bank', 'e_wallet', 'cash', 'investment', 'other');
create type category_type     as enum ('income', 'expense');
create type transaction_type  as enum ('income', 'expense', 'transfer');
create type budget_period     as enum ('weekly', 'monthly', 'yearly');
create type loan_direction    as enum ('lent', 'borrowed');
create type family_role       as enum ('owner', 'member');
create type investment_type   as enum ('stocks', 'mutual_fund', 'crypto', 'gold', 'deposit', 'other');
create type investment_action as enum ('buy', 'sell', 'dividend', 'top_up', 'withdraw');


-- ============================================================
-- 2. TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  full_name     text,
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Family groups
create table public.family_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- Family members (join table)
create table public.family_members (
  id              uuid primary key default gen_random_uuid(),
  family_group_id uuid not null references public.family_groups(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  role            family_role not null default 'member',
  joined_at       timestamptz not null default now(),
  unique (family_group_id, user_id)
);

-- Accounts (sumber dana)
create table public.accounts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  name       text not null,
  type       account_type not null default 'bank',
  balance    numeric(15,2) not null default 0,
  currency   char(3) not null default 'IDR',
  icon       text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Categories (dengan dukungan subkategori)
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete cascade, -- null = default global
  name       text not null,
  type       category_type not null,
  icon       text,
  color      text,
  parent_id  uuid references public.categories(id) on delete set null,
  is_default boolean not null default false
);

-- Transactions
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  account_id       uuid not null references public.accounts(id) on delete restrict,
  category_id      uuid references public.categories(id) on delete set null,
  type             transaction_type not null,
  amount           numeric(15,2) not null check (amount > 0),
  note             text,
  transaction_date date not null default current_date,
  attachment_url   text,
  created_at       timestamptz not null default now()
);

-- Transfers (menghubungkan dua transaksi transfer)
create table public.transfers (
  id                  uuid primary key default gen_random_uuid(),
  from_transaction_id uuid not null unique references public.transactions(id) on delete cascade,
  to_transaction_id   uuid not null unique references public.transactions(id) on delete cascade,
  amount              numeric(15,2) not null check (amount > 0),
  created_at          timestamptz not null default now()
);

-- Budgets
create table public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount      numeric(15,2) not null check (amount > 0),
  period      budget_period not null default 'monthly',
  start_date  date not null,
  end_date    date,
  unique (user_id, category_id, period, start_date)
);

-- Savings goals
create table public.savings_goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  name           text not null,
  target_amount  numeric(15,2) not null check (target_amount > 0),
  current_amount numeric(15,2) not null default 0,
  target_date    date,
  icon           text,
  is_completed   boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Savings contributions (link ke transaksi)
create table public.savings_contributions (
  id              uuid primary key default gen_random_uuid(),
  savings_goal_id uuid not null references public.savings_goals(id) on delete cascade,
  transaction_id  uuid references public.transactions(id) on delete set null,
  amount          numeric(15,2) not null check (amount > 0),
  contributed_at  date not null default current_date
);

-- Loans / Piutang
create table public.loans (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  contact_name     text not null,
  direction        loan_direction not null,
  original_amount  numeric(15,2) not null check (original_amount > 0),
  remaining_amount numeric(15,2) not null,
  due_date         date,
  note             text,
  is_settled       boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Loan payments
create table public.loan_payments (
  id             uuid primary key default gen_random_uuid(),
  loan_id        uuid not null references public.loans(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  amount         numeric(15,2) not null check (amount > 0),
  paid_at        date not null default current_date,
  note           text
);

-- Investments
create table public.investments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  name           text not null,
  type           investment_type not null,
  initial_amount numeric(15,2) not null check (initial_amount >= 0),
  current_value  numeric(15,2) not null default 0,
  start_date     date not null default current_date,
  platform       text,
  note           text,
  created_at     timestamptz not null default now()
);

-- Investment transactions
create table public.investment_transactions (
  id            uuid primary key default gen_random_uuid(),
  investment_id uuid not null references public.investments(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  action        investment_action not null,
  amount        numeric(15,2) not null check (amount > 0),
  action_date   date not null default current_date,
  note          text
);


-- ============================================================
-- 3. INDEXES
-- ============================================================
create index idx_transactions_user_id          on public.transactions(user_id);
create index idx_transactions_account_id       on public.transactions(account_id);
create index idx_transactions_category_id      on public.transactions(category_id);
create index idx_transactions_date             on public.transactions(transaction_date desc);
create index idx_transactions_user_date        on public.transactions(user_id, transaction_date desc);
create index idx_transactions_type             on public.transactions(type);

create index idx_accounts_user_id             on public.accounts(user_id);
create index idx_categories_user_id           on public.categories(user_id);
create index idx_categories_parent_id         on public.categories(parent_id);
create index idx_budgets_user_id              on public.budgets(user_id);
create index idx_savings_goals_user_id        on public.savings_goals(user_id);
create index idx_loans_user_id               on public.loans(user_id);
create index idx_investments_user_id          on public.investments(user_id);
create index idx_family_members_user_id       on public.family_members(user_id);
create index idx_family_members_group_id      on public.family_members(family_group_id);


-- ============================================================
-- 4. UPDATED_AT TRIGGER (untuk tabel users)
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Auto-create user profile saat register
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update saldo akun otomatis saat transaksi
create or replace function public.update_account_balance()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    if new.type = 'income' then
      update public.accounts set balance = balance + new.amount where id = new.account_id;
    elsif new.type = 'expense' then
      update public.accounts set balance = balance - new.amount where id = new.account_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.type = 'income' then
      update public.accounts set balance = balance - old.amount where id = old.account_id;
    elsif old.type = 'expense' then
      update public.accounts set balance = balance + old.amount where id = old.account_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger on_transaction_balance
  after insert or delete on public.transactions
  for each row execute procedure public.update_account_balance();


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.users                   enable row level security;
alter table public.family_groups           enable row level security;
alter table public.family_members          enable row level security;
alter table public.accounts                enable row level security;
alter table public.categories              enable row level security;
alter table public.transactions            enable row level security;
alter table public.transfers               enable row level security;
alter table public.budgets                 enable row level security;
alter table public.savings_goals           enable row level security;
alter table public.savings_contributions   enable row level security;
alter table public.loans                   enable row level security;
alter table public.loan_payments           enable row level security;
alter table public.investments             enable row level security;
alter table public.investment_transactions enable row level security;

-- users: lihat profil sendiri + anggota keluarga
create policy "users: lihat sendiri"        on public.users for select using (auth.uid() = id);
create policy "users: update sendiri"       on public.users for update using (auth.uid() = id);

-- Helper function: apakah user A dan B satu family group?
create or replace function public.same_family(other_user_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.family_members fm1
    join public.family_members fm2 on fm1.family_group_id = fm2.family_group_id
    where fm1.user_id = auth.uid() and fm2.user_id = other_user_id
  );
$$;

-- users: owner bisa lihat profil anggota keluarga
create policy "users: lihat anggota keluarga" on public.users for select
  using (public.same_family(id));

-- family_groups
create policy "family_groups: owner CRUD"   on public.family_groups for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "family_groups: anggota lihat" on public.family_groups for select
  using (exists (
    select 1 from public.family_members where family_group_id = id and user_id = auth.uid()
  ));

-- family_members
create policy "family_members: owner CRUD" on public.family_members for all
  using (exists (
    select 1 from public.family_groups fg where fg.id = family_group_id and fg.owner_id = auth.uid()
  ));
create policy "family_members: lihat sendiri" on public.family_members for select
  using (user_id = auth.uid());

-- accounts
create policy "accounts: milik sendiri"     on public.accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- categories: milik sendiri + default global (user_id is null)
create policy "categories: lihat"           on public.categories for select
  using (auth.uid() = user_id or user_id is null);
create policy "categories: kelola sendiri"  on public.categories for insert with check (auth.uid() = user_id);
create policy "categories: update sendiri"  on public.categories for update using (auth.uid() = user_id);
create policy "categories: hapus sendiri"   on public.categories for delete using (auth.uid() = user_id);

-- transactions: milik sendiri + keluarga bisa lihat
create policy "transactions: kelola sendiri" on public.transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions: keluarga lihat" on public.transactions for select
  using (public.same_family(user_id));

-- transfers: akses lewat transaksi
create policy "transfers: akses sendiri" on public.transfers for select
  using (
    exists (select 1 from public.transactions t where t.id = from_transaction_id and t.user_id = auth.uid())
    or
    exists (select 1 from public.transactions t where t.id = to_transaction_id and t.user_id = auth.uid())
  );
create policy "transfers: insert sendiri" on public.transfers for insert
  with check (
    exists (select 1 from public.transactions t where t.id = from_transaction_id and t.user_id = auth.uid())
  );

-- budgets
create policy "budgets: milik sendiri"      on public.budgets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- savings_goals
create policy "savings_goals: milik sendiri" on public.savings_goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- savings_contributions
create policy "savings_contributions: lewat goal" on public.savings_contributions for all
  using (exists (
    select 1 from public.savings_goals sg where sg.id = savings_goal_id and sg.user_id = auth.uid()
  ));

-- loans
create policy "loans: milik sendiri"        on public.loans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- loan_payments
create policy "loan_payments: lewat loan"   on public.loan_payments for all
  using (exists (
    select 1 from public.loans l where l.id = loan_id and l.user_id = auth.uid()
  ));

-- investments
create policy "investments: milik sendiri"  on public.investments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- investment_transactions
create policy "investment_transactions: lewat investment" on public.investment_transactions for all
  using (exists (
    select 1 from public.investments i where i.id = investment_id and i.user_id = auth.uid()
  ));


-- ============================================================
-- 6. DEFAULT CATEGORIES (global, user_id = null)
-- ============================================================
insert into public.categories (id, user_id, name, type, icon, color, is_default) values
  -- Pemasukan
  (gen_random_uuid(), null, 'Gaji',           'income',  '💼', '#22c55e', true),
  (gen_random_uuid(), null, 'Freelance',       'income',  '💻', '#16a34a', true),
  (gen_random_uuid(), null, 'Investasi',       'income',  '📈', '#15803d', true),
  (gen_random_uuid(), null, 'Hadiah',          'income',  '🎁', '#86efac', true),
  (gen_random_uuid(), null, 'Lainnya (masuk)', 'income',  '➕', '#bbf7d0', true),
  -- Pengeluaran
  (gen_random_uuid(), null, 'Makanan & Minuman','expense', '🍜', '#ef4444', true),
  (gen_random_uuid(), null, 'Transportasi',    'expense', '🚗', '#f97316', true),
  (gen_random_uuid(), null, 'Belanja',         'expense', '🛒', '#eab308', true),
  (gen_random_uuid(), null, 'Kesehatan',       'expense', '💊', '#ec4899', true),
  (gen_random_uuid(), null, 'Pendidikan',      'expense', '📚', '#8b5cf6', true),
  (gen_random_uuid(), null, 'Hiburan',         'expense', '🎮', '#06b6d4', true),
  (gen_random_uuid(), null, 'Tagihan & Utilitas','expense','💡','#64748b', true),
  (gen_random_uuid(), null, 'Rumah',           'expense', '🏠', '#78716c', true),
  (gen_random_uuid(), null, 'Pakaian',         'expense', '👕', '#a78bfa', true),
  (gen_random_uuid(), null, 'Donasi',          'expense', '❤️', '#fb7185', true),
  (gen_random_uuid(), null, 'Lainnya (keluar)','expense', '➖', '#d1d5db', true);


-- ============================================================
-- 7. SEED DATA (untuk testing)
--    Catatan: ganti UUID di bawah dengan user yang sudah terdaftar,
--    atau jalankan setelah daftar akun via Supabase Auth.
-- ============================================================

-- Pakai UUID tetap agar seed bisa diulang
do $$
declare
  uid_andi   uuid := '00000000-0000-0000-0000-000000000001';
  uid_siti   uuid := '00000000-0000-0000-0000-000000000002';
  uid_reza   uuid := '00000000-0000-0000-0000-000000000003';

  fg_id      uuid := gen_random_uuid();

  acc_bca    uuid := gen_random_uuid();
  acc_gopay  uuid := gen_random_uuid();
  acc_cash   uuid := gen_random_uuid();
  acc_siti   uuid := gen_random_uuid();

  cat_gaji   uuid;
  cat_makan  uuid;
  cat_transport uuid;
  cat_belanja uuid;
  cat_tagihan uuid;
  cat_hiburan uuid;

  trx1 uuid := gen_random_uuid();
  trx2 uuid := gen_random_uuid();
  trx3 uuid := gen_random_uuid();
  trx4 uuid := gen_random_uuid();
  trx5 uuid := gen_random_uuid();
  trx6 uuid := gen_random_uuid();
  trx7 uuid := gen_random_uuid(); -- transfer from
  trx8 uuid := gen_random_uuid(); -- transfer to
  trx_loan uuid := gen_random_uuid();
  trx_invest uuid := gen_random_uuid();

  goal_id    uuid := gen_random_uuid();
  loan_id    uuid := gen_random_uuid();
  invest_id  uuid := gen_random_uuid();
begin

  -- Ambil category IDs dari default categories
  select id into cat_gaji      from public.categories where name = 'Gaji' and is_default = true limit 1;
  select id into cat_makan     from public.categories where name = 'Makanan & Minuman' and is_default = true limit 1;
  select id into cat_transport from public.categories where name = 'Transportasi' and is_default = true limit 1;
  select id into cat_belanja   from public.categories where name = 'Belanja' and is_default = true limit 1;
  select id into cat_tagihan   from public.categories where name = 'Tagihan & Utilitas' and is_default = true limit 1;
  select id into cat_hiburan   from public.categories where name = 'Hiburan' and is_default = true limit 1;

  -- === USERS (seed manual, bypass trigger) ===
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
  values
    (uid_andi, 'andi@example.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"username":"andi","full_name":"Andi Pratama"}'::jsonb),
    (uid_siti, 'siti@example.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"username":"siti","full_name":"Siti Rahayu"}'::jsonb),
    (uid_reza, 'reza@example.com',  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"username":"reza","full_name":"Reza Firmansyah"}'::jsonb)
  on conflict (id) do nothing;

  insert into public.users (id, username, full_name) values
    (uid_andi, 'andi',  'Andi Pratama'),
    (uid_siti, 'siti',  'Siti Rahayu'),
    (uid_reza, 'reza',  'Reza Firmansyah')
  on conflict (id) do nothing;

  -- === FAMILY GROUP ===
  insert into public.family_groups (id, name, owner_id) values
    (fg_id, 'Keluarga Pratama', uid_andi);

  insert into public.family_members (family_group_id, user_id, role) values
    (fg_id, uid_andi, 'owner'),
    (fg_id, uid_siti, 'member'),
    (fg_id, uid_reza, 'member');

  -- === ACCOUNTS ===
  insert into public.accounts (id, user_id, name, type, balance, icon) values
    (acc_bca,   uid_andi, 'BCA Utama',  'bank',     8500000, '🏦'),
    (acc_gopay, uid_andi, 'GoPay',      'e_wallet', 350000,  '💚'),
    (acc_cash,  uid_andi, 'Dompet',     'cash',     200000,  '💵'),
    (acc_siti,  uid_siti, 'BRI Tabungan','bank',    3200000, '🏦');

  -- === TRANSACTIONS — Andi ===

  -- Gaji bulan ini
  insert into public.transactions (id, user_id, account_id, category_id, type, amount, note, transaction_date) values
    (trx1, uid_andi, acc_bca, cat_gaji, 'income', 8000000, 'Gaji April 2025', current_date - 15);

  -- Pengeluaran harian
  insert into public.transactions (id, user_id, account_id, category_id, type, amount, note, transaction_date) values
    (trx2, uid_andi, acc_cash,  cat_makan,    'expense', 45000,  'Makan siang warteg', current_date - 14),
    (trx3, uid_andi, acc_gopay, cat_transport,'expense', 25000,  'Grab ke kantor',     current_date - 13),
    (trx4, uid_andi, acc_bca,   cat_tagihan,  'expense', 350000, 'Listrik & internet', current_date - 10),
    (trx5, uid_andi, acc_bca,   cat_belanja,  'expense', 580000, 'Belanja bulanan',    current_date - 8),
    (trx6, uid_andi, acc_gopay, cat_hiburan,  'expense', 54000,  'Netflix 1 bulan',    current_date - 5);

  -- Transfer BCA → GoPay
  insert into public.transactions (id, user_id, account_id, category_id, type, amount, note, transaction_date) values
    (trx7, uid_andi, acc_bca,   null, 'transfer', 300000, 'Top up GoPay', current_date - 3),
    (trx8, uid_andi, acc_gopay, null, 'transfer', 300000, 'Top up GoPay', current_date - 3);

  insert into public.transfers (from_transaction_id, to_transaction_id, amount) values
    (trx7, trx8, 300000);

  -- Transaksi Siti
  insert into public.transactions (id, user_id, account_id, category_id, type, amount, note, transaction_date) values
    (gen_random_uuid(), uid_siti, acc_siti, cat_gaji,  'income',  4500000, 'Gaji April Siti', current_date - 15),
    (gen_random_uuid(), uid_siti, acc_siti, cat_makan, 'expense', 85000,   'Groceries pasar', current_date - 7),
    (gen_random_uuid(), uid_siti, acc_siti, cat_belanja,'expense',230000,  'Beli baju anak',  current_date - 4);

  -- === BUDGET ===
  insert into public.budgets (user_id, category_id, amount, period, start_date) values
    (uid_andi, cat_makan,    1500000, 'monthly', date_trunc('month', current_date)),
    (uid_andi, cat_transport, 500000, 'monthly', date_trunc('month', current_date)),
    (uid_andi, cat_hiburan,   300000, 'monthly', date_trunc('month', current_date)),
    (uid_andi, cat_belanja,   800000, 'monthly', date_trunc('month', current_date));

  -- === SAVINGS GOAL ===
  insert into public.savings_goals (id, user_id, name, target_amount, current_amount, target_date, icon) values
    (goal_id, uid_andi, 'Liburan Bali', 5000000, 1200000, current_date + 90, '🏖️');

  insert into public.savings_contributions (savings_goal_id, amount, contributed_at) values
    (goal_id, 700000, current_date - 20),
    (goal_id, 500000, current_date - 5);

  -- === LOAN ===
  insert into public.loans (id, user_id, contact_name, direction, original_amount, remaining_amount, due_date, note) values
    (loan_id, uid_andi, 'Budi Santoso', 'lent', 500000, 300000, current_date + 30, 'Pinjam buat bayar kos');

  insert into public.transactions (id, user_id, account_id, category_id, type, amount, note, transaction_date) values
    (trx_loan, uid_andi, acc_bca, null, 'expense', 200000, 'Pembayaran pinjaman Budi (cicilan 1)', current_date - 25);

  insert into public.loan_payments (loan_id, transaction_id, amount, paid_at, note) values
    (loan_id, trx_loan, 200000, current_date - 25, 'Cicilan pertama');

  -- === INVESTMENT ===
  insert into public.investments (id, user_id, name, type, initial_amount, current_value, platform, start_date) values
    (invest_id, uid_andi, 'Reksa Dana Campuran', 'mutual_fund', 2000000, 2150000, 'Bibit', current_date - 60);

  insert into public.transactions (id, user_id, account_id, category_id, type, amount, note, transaction_date) values
    (trx_invest, uid_andi, acc_bca, null, 'expense', 2000000, 'Top up reksa dana Bibit', current_date - 60);

  insert into public.investment_transactions (investment_id, transaction_id, action, amount, action_date) values
    (invest_id, trx_invest, 'top_up', 2000000, current_date - 60);

end $$;


-- ============================================================
-- 8. STORAGE BUCKET (attachment foto struk)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  5242880, -- 5 MB max
  array['image/jpeg','image/png','image/webp','image/heic','application/pdf']
) on conflict (id) do nothing;

-- RLS untuk storage
create policy "attachments: upload sendiri"
  on storage.objects for insert
  with check (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "attachments: lihat sendiri"
  on storage.objects for select
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "attachments: hapus sendiri"
  on storage.objects for delete
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================
-- SELESAI!
-- Cara pakai seed:
--   1. Jalankan file ini di SQL Editor Supabase
--   2. Login dengan: andi@example.com / password123
--                    siti@example.com / password123
--                    reza@example.com / password123
-- ============================================================
