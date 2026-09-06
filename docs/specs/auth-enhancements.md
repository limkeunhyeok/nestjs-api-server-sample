# 인증 서버 기능 강화 — 최종 사양 및 리포트

본 문서는 인증 서버 보안성 향상 및 추가 요구사항 구현을 위해 완료된 5가지 핵심 기능에 대한 설계 사양과 세부 사항을 명시합니다.

---

## 🚀 주요 구현 기능

### 1. JWKS 기반 공개키 배포
`jose` 라이브러리의 네이티브 기능을 사용하여 보안성과 표준 준수를 강화했습니다.
- **엔드포인트**: `GET /.well-known/jwks.json`
- **보안 설계**: `exportJWK`를 사용하여 배포용 JWK에서 비밀키 필드(`d`)가 포함되지 않도록 원천 차단했습니다.
- **성능 최적화**: 애플리케이션 시작 시(`OnModuleInit`) 키를 한 번 로드하여 캐싱하고, `createLocalJWKSet`을 통해 고성능 검증 루틴을 구성했습니다.

### 2. 고도화된 개발용 토큰 (Dev Token)
- **Admin 전용**: 관리자만 발급 가능하며, DB(`dev_token` 테이블)에 메타데이터를 저장하여 관리합니다.
- **상태 관리**: 특정 토큰의 `jti`(JWT ID)를 기반으로 실시간 폐기 여부를 확인합니다.
- **안전 장치**: 운영 환경(`NODE_ENV=production`)에서는 발급 및 사용이 제한되도록 설계되었습니다.

### 3. 실시간 활성 사용자 추적
- **Redis 활용**: `ZSET` 자료구조를 사용하여 최근 5분 내 활동이 있는 사용자를 집계합니다.
- **관리자 API**: 현재 접속자 수 및 접속자 ID 목록을 조회하는 엔드포인트를 제공합니다.

### 4. 세션 관리 및 토큰 블랙리스트
- **로그아웃**: `POST /auth/logout` 호출 시 사용 중인 토큰의 남은 수명만큼 Redis 블랙리스트에 등록합니다.
- **미들웨어 통합**: 모든 요청 시 블랙리스트 여부를 즉시 확인하여 보안을 강화했습니다.

### 5. API 속도 제한 (Rate Limiting)
- **IP 기반**: Redis의 sliding window 카운터를 사용하여 무차별 대입 공격을 방어합니다.
- **커스텀 제한**: 로그인(10분), 회원가입(5분), 비밀번호 초기화(3분) 등 주요 엔드포인트에 최적화된 제한을 적용했습니다.

---

## 📦 변경 파일 상세

### 신규 생성 파일 (12개)
- `src/modules/auth/jwks.controller.ts`: JWKS 배포 컨트롤러
- `src/modules/auth/dev-token.service.ts` / `controller.ts` / `entity.ts`: 개발용 토큰 모듈
- `src/modules/auth/active-users.service.ts` / `controller.ts`: 활성 사용자 추적 모듈
- `src/modules/auth/token-blacklist.service.ts`: 로그아웃 블랙리스트 모듈
- `src/common/guards/rate-limit.guard.ts`: Redis 기반 속도 제한 가드
- `src/common/decorators/rate-limit.decorator.ts`: 설정용 데코레이터
- 기타 DTO 및 인터페이스 파일들

### 수정된 파일 (5개)
- `src/modules/jose-jwt/jose-jwt.service.ts`: `jose` 네이티브 기능(`createLocalJWKSet`, `exportJWK`) 적용
- `src/modules/auth/auth.middleware.ts`: 블랙리스트/Dev토큰 체크 로직 통합
- `src/app.module.ts`: 전역 가드 및 미들웨어 설정 업데이트
- `src/configurations/typeorm.config.ts`: `DevTokenEntity` 등록
- `src/modules/auth/auth.service.ts`: 로그아웃 및 블랙리스트 연동
