---
status: accepted
date: 2026-09-04
decision-makers: [Antigravity, Developer]
---

# 0004. NestJS 12 프레임워크 메이저 마이그레이션 및 모듈 호환성 전략

## 맥락과 문제 정의 (Context and Problem Statement)

NestJS v12가 공식 출시됨에 따라 최신 프레임워크 보안 패치, 성능 최적화, 그리고 Standard Schema 공식 지원 등 현대화된 생태계 혜택을 수용하기 위해 프레임워크 메이저 업그레이드가 필요합니다. 
그러나 NestJS v12는 패키지가 Native ESM으로 전면 전환되었으며, Node.js 런타임 최소 버전이 상향(`v20.19+`, `v22.12+`)되었고, Joi 옵션 구조 변경 및 Standard Schema 기반의 새로운 검증 파이프가 도입되었습니다. 기존의 안정적인 CommonJS 프로젝트 구조와 커스텀 유효성 검증 체계를 유지하면서 안전하게 v12로 전환하기 위한 기술적 전략을 어떻게 수립해야 할까요?

## 의사결정 동기 (Decision Drivers)

* **프레임워크 최신성 및 보안/성능 확보**: NestJS 12 코어 및 관련 패키지의 공식 지원 및 최신 성능 최적화(Native ESM 빌드 등) 수혜.
* **리스크 최소화 및 호환성 보장**: 기존 CommonJS 기반 빌드 환경과 비즈니스 로직, DTO 유효성 검증 파이프라인의 회귀(Regression) 없이 무중단 업그레이드 달성.
* **점진적 현대화(Gradual Modernization)**: NestJS 12에서 도입된 Standard Schema(Zod 등 1등 시민 지원) 등의 신기능을 강제 전면 전환하지 않고, 프로젝트가 준비되었을 때 단계별로 도입할 수 있는 유연성 확보.

## 검토한 대안들 (Considered Options)

* **대안 1: NestJS 11 유지 (업그레이드 보류)**
  - 현재 안정적으로 운영 중인 NestJS 11 버전을 유지하고 마이그레이션을 진행하지 않음.
* **대안 2: NestJS 12 전면 전환 및 Pure ESM / Standard Schema 동시 개편 (Big Bang 전환)**
  - NestJS 12로 업그레이드함과 동시에 `package.json`에 `"type": "module"`을 선언하여 프로젝트 전체를 순수 ESM으로 전환하고, 기존 커스텀 `DtoValidationPipe`를 NestJS 12의 네이티브 `StandardSchemaValidationPipe`로 일괄 교체.
* **대안 3: 점진적 NestJS 12 마이그레이션 및 런타임 호환성 전략 채택 (선택)**
  - 패키지 의존성을 NestJS 12 메이저 버전으로 업그레이드하되, Node.js 22/24의 `require(esm)` 기능을 활용하여 기존 CommonJS 빌드/번들 설정을 그대로 유지함.
  - 유효성 검증 역시 기존 커스텀 `DtoValidationPipe`의 동작 무결성을 100% 보장한 뒤, 추후 별도 과제로 Standard Schema 네이티브 파이프라인 전환을 추진함.

## 결정 내용 및 결과 (Decision Outcome)

선택한 안: **대안 3 (점진적 NestJS 12 마이그레이션 및 런타임 호환성 전략)**

이유: Node.js 최신 런타임(v24.11.1) 환경에서는 NestJS 12의 ESM 패키지를 별도의 순수 ESM 전환 비용 없이 CommonJS 환경에서 완벽히 로드할 수 있습니다. 이를 통해 빌드 툴체인(`nest-cli`, `swc`, `jest`)의 호환성 리스크를 0에 가깝게 유지하면서, 프레임워크 코어만 안전하게 메이저 업그레이드할 수 있기 때문입니다.

### 기대 효과 및 영향 (Consequences)

* **장점**:
  - **무중단 무결성 보장**: 전체 프로젝트의 import 구문이나 빌드 스크립트를 대대적으로 뜯어고칠 필요 없이 코어 의존성 업데이트만으로 v12 업그레이드 완료.
  - **도메인 및 비즈니스 무결성 유지**: DDD 도메인 모델 및 애플리케이션 계층 코드 변경이 전혀 발생하지 않음.
  - **미래 확장성 확보**: Standard Schema 지원이 프레임워크 차원에서 열려 있으므로, 향후 필요 시 Zod 스키마를 컨트롤러 데코레이터(`@Body({ schema })`)에서 바로 사용하는 구조로 자연스럽게 확장 가능.
* **단점 및 트레이드오프**:
  - Node.js 최소 버전 제약이 생겨 구버전 Node.js(v18 등) 환경에서의 실행이 불가능해집니다. (단, 본 프로젝트는 이미 Node 24.11.1을 사용 중이므로 영향 없음)
  - NestJS 12의 신규 도구(Rspack, Vitest)로 즉시 전환하지 않으므로 기존 Jest/SWC 빌드 체인을 당분간 유지하게 됩니다.

### 구현 검증 계획 (Confirmation)

1. **의존성 업데이트**: `@nestjs/*` 패키지를 12.0.x 버전으로 일괄 승격하고 `pnpm install` 정상 수행 확인.
2. **타입 무결성 검증**: `pnpm run typecheck`를 수행하여 NestJS 12 인터페이스 변경에 따른 타입 깨짐이 없는지 확인.
3. **린트 검증**: `pnpm run lint`를 통해 ESLint 규칙 준수 확인.
4. **기능 검증**: 기존 단위 테스트(`pnpm run test`) 및 E2E 테스트(`pnpm run test:e2e`) 전체 통과 확인.
5. **빌드 검증**: `pnpm run build`를 수행하여 SWC 컴파일러 기반 프로덕션 번들 생성이 완벽히 성공하는지 검증.

## 대안별 장단점 세부 비교 (Pros and Cons of the Options)

### 대안 1 (NestJS 11 유지)
* **장점**: 변경 작업 공수 없음.
* **단점**: 장기적으로 보안 패치 지원이 중단되고, 최신 NestJS 기능 및 생태계 패키지와의 호환성 결여.

### 대안 2 (Pure ESM + Standard Schema 일괄 전환)
* **장점**: 가장 최신의 모던 Node.js 표준을 한 번에 달성할 수 있음.
* **단점**: Jest, ts-jest, SWC, Swagger 플러그인, 상대 경로 확장자(`.js`) 강제 등 모듈 시스템 충돌로 인한 대규모 수정과 높은 회귀 결함 위험 발생.

### 대안 3 (점진적 NestJS 12 마이그레이션)
* **장점**: 프레임워크 메이저 업그레이드의 혜택을 취하면서도 툴체인 및 소스 코드의 전면 수정 리스크를 원천 차단함.
* **단점**: 순수 ESM으로의 전환은 추후 단계적인 작업으로 이월됨.

## 참고 및 관련 정보 (More Information)

* [NestJS v12 공식 마이그레이션 가이드](https://docs.nestjs.com/migration-guide)
* Node.js `require(esm)` 지원 사양 (Node.js v20.19+, v22.12+)
