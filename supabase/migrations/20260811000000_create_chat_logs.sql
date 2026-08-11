create table atau_dd_chat_logs (
  id bigint generated always as identity primary key,
  question text not null,
  matched_title text,
  matched_score float,
  no_match boolean not null,
  answer text,
  created_at timestamptz not null default now()
);

alter table atau_dd_chat_logs enable row level security;

create policy "allow insert from anon"
  on atau_dd_chat_logs
  for insert
  to anon
  with check (true);
