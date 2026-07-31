-- 앱뜰 관리자 모드용 Supabase 초기 설정
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하세요.

-- 1) 앱뜰 공식 앱 테이블
create table public.apps (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null default '',
  thumbnail text not null default '',
  url text not null,
  category text not null check (category in ('교과', '학급운영', '창체', '연수')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 2) 바이브 신답 습작 테이블
create table public.vibe_items (
  id bigint generated always as identity primary key,
  title text not null,
  url text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- 3) RLS 활성화 (정책을 만들지 않음 = 외부에서 직접 접근 불가,
--    서버의 service role key로만 읽기/쓰기 가능)
alter table public.apps enable row level security;
alter table public.vibe_items enable row level security;

-- 4) 썸네일 저장용 공개 버킷
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true);
