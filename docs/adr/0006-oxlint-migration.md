---
status: proposed
date: 2026-09-05
decision-makers: [Antigravity, Developer]
---

# 0006. Rust 기반 고속 린터 Oxlint 도입 및 ESLint 도구 체인 마이그레이션

## 맥락과 문제 정의 (Context and Problem Statement)

NestJS 12 릴리스와 함께 공식 린터 기본 권장 도구가 기존의 무거운 ESLint에서 Rust 기반 초고속 린터인 **Oxlint**로 전환되었습니다.
또한 현재 프로젝트는 TypeScript 7.0으로 메이저 업그레이드를 완료하였으나, 기존 `@typescript-eslint` 도구 체인이 TypeScript 7.0의 네이티브 Go 컴파일러 환경(JS Compiler API 부재)을 지원하지 못하여 임시 호환 브릿지(`scripts/ts6-compat.cjs`)와 `@typescript/typescript6` 패키지에 의존하고 있었으며, 이로 인해 `WARNING: You are currently running a version of TypeScript which is not officially supported`와 같은 비호환 경고가 지속적으로 발생하고 있었습니다.
따라서 NestJS 12의 표준 도구 체인 준수와 TypeScript 7.0 네이티브 환경과의 완전한 정합성을 달성하기 위해 Oxlint로의 마이그레이션 전략이 필요합니다.

## 의사결정 동기 (Decision Drivers)

* **초고속 린팅 성능 (50~100배 단축)**: Rust 기반의 네이티브 멀티스레드 정적 분석을 통해 CI/CD 및 로컬 개발 환경의 피드백 속도를 극대화.
* **TypeScript 7.0 네이티브 호환 및 임시 브릿지 제거**: JS 컴파일러 API에 의존하는 복잡한 호환 스크립트(`scripts/ts6-compat.cjs`) 및 `@typescript/typescript6` 의존성을 완전히 제거하여 도구 체인 순수성 회복.
* **아키텍처 제약 규칙 유지**: 프로젝트의 핵심 비즈니스 정체성을 보장하는 DDD 계층 격리 규칙(`no-restricted-imports`)을 Oxlint의 네이티브 규칙으로 완벽히 유지.
* **NestJS 12 표준 권장 사항 준수**: 최신 NestJS 12 생태계 표준과의 동기화.

## 검토한 대안들 (Considered Options)

* **대안 1: Oxlint 전면 전환 (단독 린터 채택)**
* **대안 2: Oxlint + ESLint 하이브리드(Side-by-Side) 유지**
* **대안 3: 기존 ESLint 유지 및 ts-bridge 유지**

## 결정 내용 및 결과 (Decision Outcome)

선택한 안: **"대안 1: Oxlint 전면 전환 (단독 린터 채택)"**

이유: 현재 본 프로젝트의 린트 요구사항(코어 자바스크립트/타입스크립트 모범 사례 및 레이어 격리를 위한 `no-restricted-imports`)은 Oxlint에서 네이티브로 100% 지원되며, ESLint를 완전히 대체함으로써 무거운 ESLint 플러그인 의존성 체인을 정리하고 도구 체인의 복잡성을 획기적으로 낮출 수 있기 때문입니다.

### 기대 효과 및 영향 (Consequences)

* 장점:
  * 린트 검사 실행 시간이 기존 대비 대폭 단축되어 즉각적인 개발 피드백 가능.
  * TypeScript 버전 불일치 경고 메시지 및 임시 브릿지 스크립트(`scripts/ts6-compat.cjs`) 완전 제거.
  * `eslint`, `@typescript-eslint/*`, `globals` 등 무거운 JS 기반 린트 종속성을 정리하여 `node_modules` 경량화.
  * NestJS 12 공식 가이드 및 Oxc 표준 생태계와의 완벽한 정렬.
* 단점:
  * 향후 Oxlint가 아직 네이티브로 지원하지 않는 서드파티 ESLint 커스텀 플러그인을 도입할 경우 JS Plugins 설정을 경유해야 함.

### 구현 검증 계획 (Confirmation)

1. `@oxlint/migrate`를 실행하여 기존 `eslint.config.mjs`의 모든 규칙과 `no-restricted-imports` 설정을 `.oxlintrc.json`으로 변환.
2. `pnpm run lint` 스크립트를 `oxlint` 명령어로 교체하고 실행하여 0 에러 무결성 검증.
3. 프로젝트 5대 표준 검증 파이프라인(`typecheck`, `lint`, `test`, `test:e2e`, `build`)의 100% 통과 여부 확인.

---

## 대안별 장단점 세부 비교 (Pros and Cons of the Options)

### 대안 1: Oxlint 전면 전환 (선택됨)

* 장점: 가장 빠른 실행 속도, 설정 파일의 단일화(`.oxlintrc.json`), 불필요한 레거시 린트 패키지 및 브릿지 제거.
* 단점: 일부 미지원 ESLint 특수 규칙 도입 시 제약.

### 대안 2: Oxlint + ESLint 하이브리드

* 장점: Oxlint가 미지원하는 규칙을 ESLint가 보완.
* 단점: ESLint 구동을 위해 여전히 TypeScript 6 호환 브릿지와 무거운 ESLint 종속성을 계속 유지해야 하며, 이중 검사로 인한 파이프라인 복잡도 증가.

### 대안 3: 기존 ESLint 유지

* 장점: 기존 설정 유지로 추가 마이그레이션 불필요.
* 단점: TypeScript 7.0과의 버전 불일치 경고 및 임시 호환 브릿지 지속 사용, 느린 린트 속도 유지.

---

## 참고 및 관련 정보 (More Information)

* [Oxlint 공식 마이그레이션 가이드](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html)
* [Oxlint 규칙 지원 목록](https://oxc.rs/docs/guide/usage/linter/rules.html)
* [ADR 0005: TypeScript 7.0 메이저 마이그레이션](./0005-typescript-7-migration.md)
