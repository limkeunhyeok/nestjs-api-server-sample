---
status: accepted
date: 2026-09-04
decision-makers: [Antigravity, Developer]
---

# 0005. TypeScript 7.0 메이저 마이그레이션 및 컴파일러 도구 체인 호환성 전략

## 맥락과 문제 정의 (Context and Problem Statement)

TypeScript 7.0이 공식 릴리스되었습니다. TypeScript 7.0은 Go 언어로 전면 재작성된 네이티브 컴파일러를 탑재하여 기존 대비 최대 10배 빠른 타입 검사 속도를 제공합니다.
그러나 TypeScript 7.0은 `tsconfig.json` 사양의 Breaking Changes(`baseUrl` 지원 중단, `types` 기본값의 `[]` 변경 등)와 함께, 기존 JS 프로그래밍 방식 컴파일러 API(`import ts from 'typescript'`)가 네이티브 포트 과도기 상태로 인해 제한됩니다. 이로 인해 ESLint(`@typescript-eslint`), `ts-node`, Nest CLI SWC 플러그인 등 기존 개발 도구 체인과의 호환성을 유지하면서 TypeScript 7.0의 고속 컴파일러 혜택을 안전하게 적용하기 위한 마이그레이션 전략이 필요합니다.

## 의사결정 동기 (Decision Drivers)

* **초고속 타입 체크 성능 달성**: 네이티브 `tsc`를 통해 CI 및 로컬 개발 환경의 타입 체크(`pnpm run typecheck`) 속도 극대화.
* **설정 사양 표준화**: TypeScript 7.0에서 권장하는 모던 `tsconfig` 사양 준수 (`baseUrl` 의존성 제거, 명시적 `types` 선언).
* **개발 도구 체인(ESLint, SWC, Jest) 안정성 확보**: TypeScript 7.0 컴파일러 변경으로 인한 린트(`eslint`), 빌드(`swc`), 테스트(`@swc/jest`) 파이프라인의 회귀 결함 방지.
* **불필요한 캐시 아티팩트 격리**: 증분 컴파일 캐시 파일(`*.tsbuildinfo`)의 `.gitignore` 등록 및 버전 관리 제외.

## 검토한 대안들 (Considered Options)

* **대안 1: TypeScript 5.9 유지 (업그레이드 보류)**
  - 현재 안정적으로 동작하는 버전을 유지하되, 10배 빠른 네이티브 컴파일러 성능 혜택을 포기함.
* **대안 2: TypeScript 7.0 단독 일괄 업그레이드 및 tsconfig 사양 표준화 (선택)**
  - `typescript@^7.0.2`로 업그레이드하고, `tsconfig.base.json`과 `tsconfig.test.json`의 `baseUrl` 제거 및 명시적 `types` 정의(`["node", "jest"]`)를 적용함.
  - 빌드(`swc`) 및 테스트(`@swc/jest`)는 이미 SWC 기반으로 분리되어 있으므로, `tsc`는 순수 정적 타입 검증(`typecheck`)의 고속 실행 엔진으로 활용함.
  - ESLint 및 도구 체인의 호환성을 검증하고 필요 시 `@typescript/v6` 호환 패키지 또는 ESLint 설정을 보정함.

## 결정 내용 및 결과 (Decision Outcome)

선택한 안: **대안 2 (TypeScript 7.0 단독 일괄 업그레이드 및 tsconfig 사양 표준화)**

이유: 본 프로젝트는 이미 애플리케이션 빌드와 테스트 러너가 TypeScript 컴파일러 API에 직접 의존하지 않고 **SWC(`@swc/core`, `@swc/jest`)**를 통해 독립적으로 수행되도록 설계되어 있습니다. 따라서 `tsc`는 순수 정적 타입 검사(`pnpm run typecheck`) 용도로 동작하므로, TypeScript 7.0 네이티브 컴파일러의 10x 성능 향상 혜택을 가장 이상적이고 안전하게 누릴 수 있기 때문입니다.

### 기대 효과 및 영향 (Consequences)

* **장점**:
  - **10배 빠른 타입 검증**: `pnpm run typecheck` 속도가 획기적으로 단축되어 개발 피드백 루프 개선.
  - **최신 언어 표준 준수**: `baseUrl` 제거 및 모던 `paths` 해석 규칙 준수.
  - **Git 저장소 청결 유지**: `*.tsbuildinfo`를 `.gitignore`에 등록하여 수만 줄에 달하는 캐시 변경점 추적 방지.
* **단점 및 트레이드오프**:
  - `types: []` 기본값 변경에 따라 `@types/*` 라이브러리의 전역 타입 사용 시 명시적인 `types` 지정이 요구됨.
  - JS 컴파일러 API에 의존하는 일부 레거시 도구의 경우 TypeScript 7.1 이전까지 호환성 점검이 수반됨.

### 구현 검증 계획 (Confirmation)

1. **글로벌 및 프로젝트 패키지 업데이트**: 글로벌 `typescript@7.0.2` 설치 완료 확인 및 `package.json`의 devDependencies에 `typescript@^7.0.2` 반영.
2. **tsconfig 현대화**:
   - `tsconfig.base.json`: `baseUrl: "./"` 제거, `types: ["node", "jest"]` 명시.
   - `.gitignore`: `*.tsbuildinfo` 추가.
3. **무결성 검증 파이프라인 (AGENTS.md 4.10)**:
   - `pnpm run typecheck` (TS 7.0 네이티브 검증)
   - `pnpm run lint` (ESLint 파서 호환성 검증)
   - `pnpm run test` (단위 테스트)
   - `pnpm run test:e2e` (E2E 테스트)
   - `pnpm run build` (SWC 프로덕션 빌드)

## 참고 및 관련 정보 (More Information)

* [Announcing TypeScript 7.0 (Microsoft DevBlog)](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
* ADR 0004: NestJS 12 프레임워크 메이저 마이그레이션
