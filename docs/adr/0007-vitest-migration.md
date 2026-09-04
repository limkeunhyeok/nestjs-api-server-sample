---
status: accepted
date: 2026-09-05
decision-makers: [개발팀, Antigravity]
---

# 테스트 러너를 Jest에서 Vitest로 전면 마이그레이션

## 맥락과 문제 정의 (Context and Problem Statement)

프로젝트는 NestJS 12 및 TypeScript 7.0으로 성공적으로 마이그레이션되었으며, 린터 역시 Rust 기반의 초고속 Oxlint로 전환되었습니다. 그러나 현재 테스트 프레임워크는 여전히 레거시 **Jest**에 의존하고 있습니다. Jest는 다음과 같은 구조적 한계와 비효율을 가지고 있습니다:

1. **CommonJS 기반 변환 오버헤드**: Jest의 가상화 환경으로 인해 ESM-only 라이브러리(`jose`, `@paralleldrive/cuid2` 등)를 강제로 트랜스파일하기 위해 `transformIgnorePatterns`와 같은 복잡하고 취약한 정규식 설정을 유지해야 합니다.
2. **Node VM 기반 메모리 누수**: Jest의 러너 아키텍처는 격리를 위해 매 파일마다 Node VM 컨텍스트를 생성하며, 가비지 컬렉션이 완벽히 이루어지지 않아 24개의 E2E 테스트 스위트를 순차 실행할 때 메모리가 누적 증가하는 고질적인 문제가 있습니다.
3. **NestJS 12의 공식 테스트 러너 변화**: NestJS 12부터 신규 프로젝트의 기본 테스트 러너로 **Vitest**가 공식 채택되었습니다.

어떻게 하면 NestJS의 의존성 주입(DI) 데코레이터와 Testcontainers E2E 환경을 100% 안전하게 유지하면서, 테스트 실행 속도와 메모리 효율성을 극대화할 수 있을까요?

## 의사결정 동기 (Decision Drivers)

* **초고속 테스트 실행**: 네이티브 ESM과 워커 풀(Worker Threads)을 활용한 테스트 기동 속도 대폭 단축.
* **메모리 안정성**: E2E 스위트 실행 중 Node VM 기반의 메모리 누수 원천 차단.
* **NestJS DI 데코레이터 무결성**: NestJS의 `emitDecoratorMetadata` 의존성을 테스트 환경에서도 100% 온전하게 보장.
* **간결한 설정 유지**: 불필요한 `transformIgnorePatterns`, `@swc/jest` 래퍼 제거 및 모던 도구 체인 통일.

## 검토한 대안들 (Considered Options)

* **대안 1: Vitest + unplugin-swc + vite-tsconfig-paths (선택안)**
* **대안 2: 기존 Jest + @swc/jest 유지**
* **대안 3: Vitest 기본 esbuild 트랜스파일러 단독 사용**

## 결정 내용 및 결과 (Decision Outcome)

선택한 안: **"대안 1: Vitest + unplugin-swc + vite-tsconfig-paths"**

이유: Vitest는 네이티브 ESM 기반으로 동작하여 기존 Jest의 변환 오버헤드와 메모리 누수 문제를 완벽히 해결합니다. 또한 Vitest 기본 컴파일러(esbuild)가 지원하지 못하는 NestJS의 `emitDecoratorMetadata`를 **`unplugin-swc`**가 완벽히 보완하므로, 기존 프로덕션 SWC 설정과 100% 일치하는 환경에서 단위 및 E2E 테스트를 안정적으로 수행할 수 있습니다.

### 기대 효과 및 영향 (Consequences)

* **장점**:
  - 네이티브 ESM 지원으로 `transformIgnorePatterns` 같은 복잡한 트랜스파일 우회 설정 완전 소멸.
  - Worker Threads 기반 병렬/격리 제어로 메모리 누수 문제 해결 및 실행 안정성 증대.
  - Vite HMR 기반의 초고속 Watch 모드로 개발자 경험(DX) 극대화.
  - NestJS 12 표준 권장 테스트 도구 체인과의 완전한 일치.
* **단점**:
  - `test/global-setup.ts` 및 E2E 테스트 셋업 구조를 Vitest의 `globalSetup` 프로토콜(teardown 반환 함수)에 맞춰 리팩토링 필요.
  - `src/common/guards/role.guard.spec.ts` 등 일부 Jest 전용 API(`jest.fn()`, `fail()`)를 Vitest 표준(`vi.fn()`, `expect.fail()`)으로 조정 필요.

### 구현 검증 계획 (Confirmation)

* 단위 테스트(`pnpm run test`): 11/11 단위 테스트 100% 통과 검증.
* E2E 테스트(`pnpm run test:e2e`): Testcontainers(Postgres, Redis) 기동부터 24개 테스트 스위트, 컨테이너 teardown까지 100% 통과 검증.
* 타입 검사(`pnpm run typecheck`): `tsconfig.base.json`의 `types` 매핑 갱신 후 타입 에러 0건 검증.
* 린트 검증(`pnpm run lint`): Oxlint 0 warnings, 0 errors 검증.

## 대안별 장단점 세부 비교 (Pros and Cons of the Options)

### 대안 1: Vitest + unplugin-swc + vite-tsconfig-paths (선택안)

* **장점**:
  - 네이티브 ESM 지원 및 극적인 속도/메모리 개선.
  - SWC 플러그인을 통해 NestJS의 DI 데코레이터 메타데이터 완벽 보존.
  - tsconfig 경로 별칭(`src/*`, `test/*`) 자동 인식.
* **단점**:
  - 초기 Vitest 설정 파일(`vitest.config.mts`, `vitest.config.e2e.mts`) 작성 필요.

### 대안 2: 기존 Jest + @swc/jest 유지

* **장점**:
  - 추가 마이그레이션 공수가 발생하지 않음.
* **단점**:
  - CommonJS 환경 한계로 ESM 라이브러리 추가 시마다 `transformIgnorePatterns`를 수정해야 함.
  - E2E 테스트 실행 시 Node VM 메모리 누수 현상이 지속됨.
  - NestJS 12 모던 도구 체인 표준에서 점차 소외됨.

### 대안 3: Vitest 기본 esbuild 트랜스파일러 단독 사용

* **장점**:
  - 추가 플러그인 없이 Vitest 내장 기능만으로 가볍게 구성 가능.
* **단점**:
  - `esbuild`는 TypeScript의 `emitDecoratorMetadata`를 완전히 지원하지 못해 NestJS의 생성자 주입(DI)이 런타임에 깨지는 치명적 장애 발생.

## 참고 및 관련 정보 (More Information)

* [NestJS 12 Migration Guide](https://docs.nestjs.com/migration-guide)
* [Vitest Official Documentation](https://vitest.dev/)
* [unplugin-swc](https://github.com/unplugin/unplugin-swc)
