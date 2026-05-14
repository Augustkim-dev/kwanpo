# 인사 게시판 PRD (Product Requirements Document)

- **문서 버전**: v1.0
- **작성일**: 2026-05-14
- **상태**: Draft

---

## 1. 개요 (Overview)

### 1.1 제품명
**인사 게시판** (가칭, 추후 브랜딩 결정)

### 1.2 한 줄 소개
누구나 부담 없이 들러 인사를 남기고, 다른 사람의 인사에 가볍게 응답할 수 있는 **단일 게시판 웹사이트**.

### 1.3 핵심 컨셉
- "복잡한 커뮤니티가 아니라, 동네 벽에 포스트잇 붙이는 느낌"
- 회원가입 없이도 즉시 참여 가능
- 한 화면, 한 게시판, 한 가지 행동(인사)

---

## 2. 목적 및 배경

### 2.1 문제 정의
- 기존 커뮤니티들은 가입 절차, 등급, 카테고리 등이 부담스러움
- 가벼운 인사·일상 공유만 원하는 라이트 유저의 진입장벽이 높음

### 2.2 목표 (Goals)
1. **진입장벽 최소화**: 가입 없이 30초 안에 첫 인사 가능
2. **단순한 UX**: 메뉴/탭/카테고리 없는 한 페이지 구조
3. **친근한 분위기**: 디자인과 톤앤매너로 "환영받는 느낌" 조성

### 2.3 비목표 (Non-Goals)
- 본격적인 커뮤니티 기능 (등급, 포인트, 랭킹 등)
- 멀티 게시판 / 카테고리 분류
- 실시간 채팅
- 광고/수익화 (MVP 단계)

---

## 3. 타겟 사용자

### 3.1 주요 사용자
- 가벼운 소통을 원하는 10~40대 인터넷 사용자
- 가입 절차를 싫어하는 라이트 유저
- 일상의 짧은 메모/인사를 남기고 싶은 사람

### 3.2 페르소나 예시
- **민지 (24, 대학생)**: 새 학기 시작 기분에 누군가에게 "안녕!" 한 마디 남기고 싶음
- **재호 (35, 직장인)**: 점심시간에 잠깐 들러 다른 사람들 인사 구경하고 좋아요만 누름

---

## 4. 사용자 시나리오 (User Flows)

### 4.1 인사글 작성 플로우
1. 사이트 접속 → 게시판 첫 화면 노출
2. 상단 또는 하단의 인라인 작성 폼에 닉네임·비밀번호·본문 입력
3. "인사하기" 버튼 클릭
4. 작성한 글이 목록 최상단에 즉시 노출

### 4.2 응답(댓글) 플로우
1. 글 클릭 → 상세 페이지(또는 펼쳐보기) 진입
2. 댓글 폼에 닉네임·비밀번호·본문 입력
3. 댓글 등록 → 즉시 노출

### 4.3 수정/삭제 플로우
1. 본인 글/댓글의 "수정" 또는 "삭제" 클릭
2. 비밀번호 입력 확인
3. 일치 시 수정 모드 진입 또는 삭제 처리

---

## 5. 핵심 기능 (MVP Scope)

### 5.1 인사글 작성
| 항목 | 사양 |
|---|---|
| 닉네임 | 필수, 2~20자, 한/영/숫자 |
| 비밀번호 | 필수, 4자 이상 (수정·삭제 인증용, 해시 저장) |
| 본문 | 필수, 1~1,000자 (줄바꿈 허용) |
| 작성시각 | 서버 자동 기록 (KST) |

### 5.2 인사글 목록
- **정렬**: 최신순 고정 (MVP에서는 정렬 옵션 없음)
- **표시 형식**: 페이지당 20건, 페이지네이션 또는 무한스크롤
- **카드 정보**: 닉네임 / 본문 미리보기 (2줄) / 작성일시 / 댓글 수 / 좋아요 수

### 5.3 인사글 상세
- 본문 전체 표시
- 댓글 목록 + 댓글 작성 폼
- 좋아요 버튼
- 수정/삭제 버튼 (비밀번호 모달)

### 5.4 댓글
- 인사글과 동일한 입력 항목 (닉네임·비밀번호·본문)
- **1뎁스(대댓글 없음)**로 구조 단순화
- 본문 1~300자

### 5.5 좋아요
- 1인 1추천 (IP + 쿠키 기반 중복 방지)
- 토글 방식 (다시 누르면 취소)

### 5.6 수정/삭제
- 작성 시 입력한 비밀번호 일치 시 가능
- 삭제는 소프트 삭제(soft delete)로 처리 (관리 목적)

---

## 6. 비기능 요구사항 (Non-Functional)

### 6.1 성능
- 첫 페이지 로드 < 1.5초 (3G 기준)
- 목록 API 응답 < 300ms

### 6.2 보안 / 어뷰징 방지
- 비밀번호는 **bcrypt 등 해시**로 저장 (평문 저장 금지)
- **도배 방지**: 동일 IP에서 30초 내 재작성 불가
- **금칙어 필터**: 정규식 기반 욕설/스팸 차단 (1차 MVP는 간단한 리스트)
- XSS 방지: 본문 출력 시 이스케이프 처리
- CSRF 토큰 적용

### 6.3 반응형
- 모바일 우선 설계 (375px ~)
- 태블릿/데스크탑까지 동일 레이아웃 유연 대응

### 6.4 접근성
- 시맨틱 HTML
- 키보드 네비게이션 지원
- 색 대비 WCAG AA 수준

---

## 7. 데이터 모델 (제안)

```sql
-- 인사글
CREATE TABLE posts (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  nickname      VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  content       TEXT NOT NULL,
  ip_hash       VARCHAR(64) NOT NULL,
  like_count    INT NOT NULL DEFAULT 0,
  view_count    INT NOT NULL DEFAULT 0,
  is_deleted    TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL,
  updated_at    DATETIME NULL,
  INDEX idx_created_at (created_at DESC),
  INDEX idx_ip_hash (ip_hash)
);

-- 댓글
CREATE TABLE comments (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id       BIGINT NOT NULL,
  nickname      VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  content       VARCHAR(300) NOT NULL,
  ip_hash       VARCHAR(64) NOT NULL,
  is_deleted    TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL,
  INDEX idx_post_id (post_id, created_at)
);

-- 좋아요
CREATE TABLE likes (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id    BIGINT NOT NULL,
  ip_hash    VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uk_post_ip (post_id, ip_hash)
);
```

---

## 8. API 사양 (개략)

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/posts?page=1` | 인사글 목록 |
| POST | `/api/posts` | 인사글 작성 |
| GET | `/api/posts/:id` | 인사글 상세 |
| PATCH | `/api/posts/:id` | 인사글 수정 (비밀번호 확인) |
| DELETE | `/api/posts/:id` | 인사글 삭제 (비밀번호 확인) |
| POST | `/api/posts/:id/like` | 좋아요 토글 |
| GET | `/api/posts/:id/comments` | 댓글 목록 |
| POST | `/api/posts/:id/comments` | 댓글 작성 |
| PATCH | `/api/comments/:id` | 댓글 수정 |
| DELETE | `/api/comments/:id` | 댓글 삭제 |

---

## 9. UI/UX 가이드라인

- **톤**: 친근하고 따뜻함 ("환영합니다", "인사 한 마디 남겨주세요" 같은 문구)
- **레이아웃**:
  - 상단: 사이트 제목 + 한 줄 설명
  - 그 아래: 인라인 작성 폼 (펼쳤다 접기 가능)
  - 그 아래: 인사글 목록 (카드형)
- **컬러**: 흰색 베이스 + 부드러운 포인트 컬러 1색 (예: 따뜻한 노란/연한 핑크)
- **타이포**: 한글 본문 16~17px, 가독성 좋은 sans-serif
- **모달 최소화**: 비밀번호 입력 외에는 인라인 처리

---

## 10. 기술 스택 제안

| 영역 | 권장 1 (Lean) | 권장 2 (Scalable) |
|---|---|---|
| Frontend | 순수 HTML + Vanilla JS + 약간의 CSS | Next.js (App Router) |
| Backend | PHP + MySQL | Node.js (Express/Hono) + MySQL |
| 호스팅 | 자체 서버 (Apache/Nginx) | Vercel + PlanetScale/Supabase |
| 캐시 | (불필요) | Cloudflare CDN |

> 트래픽 예측이 낮으면 권장 1로도 충분. 익숙하신 PHP/Node 스택이라 양쪽 다 빠르게 셋업 가능합니다.

---

## 11. 일정 (제안)

| 주차 | 작업 |
|---|---|
| Week 1 | DB 설계 / API 구현 / 어뷰징 방지 로직 |
| Week 2 | Frontend 목록·상세·작성 폼 구현 |
| Week 3 | 댓글·좋아요·수정·삭제 / 모바일 반응형 |
| Week 4 | QA / 배포 / 도메인 연결 |

---

## 12. 성공 지표 (KPI)

- **활성도**: DAU, 일일 인사글 등록 수
- **참여도**: 글당 평균 댓글 수, 좋아요 수
- **재방문**: 7일 재방문율
- **품질**: 신고/삭제율, 도배 차단 건수

---

## 13. 향후 확장 아이디어 (Out of MVP)

- 이미지 1장 첨부 (썸네일)
- 이모지 리액션 (좋아요 외 다양화)
- 가벼운 회원 시스템 (이메일/소셜)
- 카테고리 또는 태그
- 신고 기능 + 관리자 페이지
- 인사글 OG 이미지 자동 생성 (SNS 공유용)

---

## 14. 오픈 이슈 / 의사결정 필요

1. **인증 방식**: 비회원(닉네임+비번) vs 간단 회원제 → *현재 PRD는 비회원 가정*
2. **도메인/브랜드명**: 미정
3. **운영 정책**: 부적절 글 신고/삭제 책임 주체
4. **데이터 보존 기간**: 영구 vs 일정 기간 후 자동 삭제
