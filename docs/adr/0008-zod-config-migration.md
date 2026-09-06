---
status: accepted
date: 2026-09-05
decision-makers: [개발팀, Antigravity]
---

# 환경 변수 검증 라이브러리를 Joi에서 Zod로 일원화

## 맥락과 문제 정의 (Context and Problem Statement)

현재 프로젝트는 비즈니스 DTO 및 도메인 입력 검증에는 **Zod**(`nestjs-zod`)를 사용하고 있는 반면, 애플리케이션 시작 시 환경 변수 검증에는 레거시 라이브러리인 **Joi**(`joi ^18.0.1`)를 혼용하고 있습니다. 이로 인해 다음과 같은 문제점이 존재합니다:

1. **스키마 도구 체인 파편화**: 프로젝트 내에서 입력 유효성 검사를 위해 서로 다른 두 개의 스키마 라이브러리(Zod, Joi)를 동시 유지보수해야 하므로 번들 크기가 증가하고 개발자의 컨텍스트 스위칭 비용이 발생합니다.
2. **우발적 외부 의존성 참조**: [src/common/decorators/user-in-token.decorator.ts](file:///Users/limkeunhyeok/Desktop/nestjs-api-server-sample/src/common/decorators/user-in-token.decorator.ts)와 같은 유틸리티 파일에서 IDE 자동완성으로 인해 Joi의 내부 타입(`NullableType`)을 불필요하게 임포트하는 의존성 누수가 발생했습니다.
3. **NestJS 12의 Standard Schema 공식 지원**: NestJS 12부터 `@nestjs/config`가 TypeScript 생태계 표준 사양인 **Standard Schema**(Zod 규격)를 기본 지원하므로, 더 이상 Joi를 유지할 기술적 이유가 사라졌습니다.

## 의사결정 동기 (Decision Drivers)

* **도구 체인 단일화**: 프로젝트 전체의 스키마 검증 엔진을 **Zod** 하나로 일원화.
* **패키지 경량화**: 불필요해진 대형 레거시 패키지인 `joi` 전면 제거.
* **타입 안전성 및 일관성**: Zod의 `z.infer<typeof ServerEnvValidation>`를 통해 런타임 검증과 정적 타입 정의 간의 100% 일치 보장.
* **NestJS 12 표준 호환**: `@nestjs/config`의 Standard Schema 네이티브 유효성 검사 파이프라인 활용.

## 검토한 대안들 (Considered Options)

* **대안 1: Zod 기반 환경 변수 스키마 전환 및 Joi 완전 제거 (선택안)**
* **대안 2: 기존 Joi 18 유지**

## 결정 내용 및 결과 (Decision Outcome)

선택한 안: **"대안 1: Zod 기반 환경 변수 스키마 전환 및 Joi 완전 제거"**

이유: NestJS 12의 코어 기능인 Standard Schema 지원을 활용하여 `server.config.ts`를 Zod로 전환하고, `joi` 패키지를 완전히 제거함으로써 프로젝트의 의존성을 경량화하고 스키마 검증 엔진을 Zod 단일 체계로 통일할 수 있습니다.

### 기대 효과 및 영향 (Consequences)

* **장점**:
  - `joi` 패키지 언인스톨을 통한 의존성 경량화.
  - Zod의 `z.coerce.number()`를 통한 문자열 환경 변수의 자동 형변환 및 강력한 에러 메시징.
  - JWK(JSON Web Key) 유효성 검사 로직을 Zod의 `.transform()` / custom issue로 직관적 재작성.
* **단점**:
  - `server.config.ts`의 유효성 검사 로직 및 `user-in-token.decorator.ts`의 타입 임포트 수정 필요.

### 구현 검증 계획 (Confirmation)

* 애플리케이션 기동 검증: `pnpm run start` 실행 시 정상 부트스트랩 확인.
* 단위 및 E2E 테스트: `pnpm run test`, `pnpm run test:e2e` 100% 통과 검증.
* 타입 및 린트 검증: `pnpm run typecheck`, `pnpm run lint` 0건 확인.

## 참고 및 관련 정보 (More Information)

* [NestJS 12 Configuration Guide](https://docs.nestjs.com/techniques/configuration)
* [Standard Schema Specification](https://standardschema.dev/)
