# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

인사 게시판 — 회원가입 없이 닉네임+비밀번호로 인사글·댓글을 남기는 단일 게시판 웹서비스.

## Stack

- **Next.js 14 App Router** (TypeScript) — 프론트엔드 + API Routes
- **Supabase** (PostgreSQL) — DB, `service_role` 키로만 서버사이드 접근
- **Tailwind CSS v4** — 설정은 `src/app/globals.css`의 `@theme` 블록, 별도 config 파일 없음
- **bcryptjs** — 비밀번호 해싱 (클라이언트에 평문 절대 저장 금지)

## Commands

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run start     # 빌드 후 서버 실행
npx tsc --noEmit  # 타입 체크
```

## Environment Variables

`.env.local` 필요:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Vercel 배포 시 동일 변수를 Project Settings > Environment Variables에 등록.

## Architecture

```
src/
├── app/
│   ├── page.tsx                     # 메인(목록) — Server Component, SSR 첫 20건
│   ├── posts/[id]/page.tsx          # 상세 — Server Component, 조회수 증가 포함
│   └── api/                         # Route Handlers (서버사이드 전담)
│       ├── posts/route.ts           # GET 목록, POST 작성
│       ├── posts/[id]/route.ts      # GET 상세, PATCH 수정, DELETE 삭제
│       ├── posts/[id]/like/route.ts # POST 좋아요 토글
│       ├── posts/[id]/comments/     # GET·POST 댓글
│       └── comments/[id]/route.ts  # PATCH·DELETE 댓글
├── components/
│   ├── PostList.tsx     # 클라이언트 — 페이지네이션, 신규 글 삽입
│   ├── PostForm.tsx     # 작성 폼 (접기/펼치기)
│   ├── PostCard.tsx     # 목록 카드
│   ├── PostDetail.tsx   # 상세 + 수정/삭제 통합 클라이언트 컴포넌트
│   ├── CommentForm.tsx  # 댓글 작성
│   ├── CommentItem.tsx  # 댓글 1개 (수정/삭제 포함)
│   ├── LikeButton.tsx   # 좋아요 토글, 쿠키(`liked_posts`) 로 UI 상태 보존
│   └── PasswordModal.tsx # 비밀번호 확인 모달 (수정/삭제 공용)
└── lib/
    ├── supabase.ts   # 서버 클라이언트 싱글턴
    ├── password.ts   # bcryptjs hash / compare
    ├── ip.ts         # IP → SHA-256 해시 (개인정보 보호)
    ├── rateLimit.ts  # 동일 IP 30초 재작성 방지
    ├── badWords.ts   # 금칙어 정규식 필터
    ├── sanitize.ts   # XSS 이스케이프
    ├── types.ts      # Post, Comment 인터페이스
    └── utils.ts      # formatDate (상대 시간)
```

## DB Schema

`supabase/schema.sql` — Supabase SQL Editor에서 실행.  
테이블: `posts`, `comments`, `likes`. RLS 비활성화, 모든 접근은 서버 API를 통해서만.

## Key Constraints

- **소프트 삭제**: 글/댓글은 `is_deleted = TRUE` 플래그로 처리, 실제 행 삭제 없음
- **비밀번호**: DB에는 `password_hash`만 저장. API에서 `bcrypt.compare` 후 수정/삭제 허용
- **좋아요 중복 방지**: `likes` 테이블의 `UNIQUE(post_id, ip_hash)` + 클라이언트 쿠키 UI
- **도배 방지**: `rateLimit.ts` — 동일 `ip_hash` 30초 이내 재작성 → 429
- **Tailwind v4**: `tailwind.config.ts` 없음. 커스텀 컬러는 `globals.css`의 `@theme` 블록에 추가
