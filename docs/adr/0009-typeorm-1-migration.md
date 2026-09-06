---
status: accepted
date: 2026-09-05
decision-makers: [개발팀, Antigravity]
---

# TypeORM 1.x 메이저 마이그레이션 및 ORM 계층 호환성 전략

## 맥락과 문제 정의 (Context and Problem Statement)

오랜 기간 `0.3.x`에 머물러 있던 TypeORM이 정식 1.0 및 1.1 메이저 릴리즈(`1.1.1`)를 발표하였습니다. TypeORM 1.x는 ECMAScript 2023 및 Node.js 20+를 기본 타겟으로 설정하고 레거시 `Connection` API와 구형 드라이버들을 전면 정리하여 모던 런타임에 최적화되었습니다.

현재 프로젝트는 NestJS 12, TypeScript 7.0, Node.js 24, ES2023 환경을 갖추고 있습니다. 데이터베이스 접근 계층과 트랜잭션 관리 도구(`typeorm-transactional`, `@nestjs/typeorm`)의 동작 안정성을 해치지 않으면서 최신 TypeORM 1.x로 안전하게 마이그레이션할 수 있을까요?

## 의사결정 동기 (Decision Drivers)

* **최신 모던 런타임 호환성**: ES2023 타겟 및 Node 24 런타임에 최적화된 최신 ORM 엔진 확보.
* **보안 및 버그 픽스 지속성**: 0.3 레거시 브랜치 대비 최신 버그 수정, 쿼리 러너 안정성 개선 사항 향유.
* **트랜잭션 및 NestJS 통합 무결성**: `@nestjs/typeorm` 12 및 `typeorm-transactional` 데코레이터와의 100% 런타임 호환 보장.
* **초정밀 DDD 계층 격리**: 인프라 레포지토리 어댑터(`infrastructure/persistence/repositories/`) 외부로 TypeORM 변경 영향 차단.

## 검토한 대안들 (Considered Options)

* **대안 1: TypeORM 1.1.1 메이저 업데이트 및 하위 호환성 검증 (선택안)**
* **대안 2: TypeORM 0.3.31 (레거시 장기 지원) 유지**
* **대안 3: Prisma 또는 Kysely 등 타 ORM으로 전면 재작성**

## 결정 내용 및 결과 (Decision Outcome)

선택한 안: **"대안 1: TypeORM 1.1.1 메이저 업데이트 및 하위 호환성 검증"**

이유: 사전 패키지 정밀 분석 결과, TypeORM 1.1.1은 우리 프로젝트가 이미 준수하고 있는 `DataSource` 및 `findOneBy` 패턴을 표준으로 채택하고 있으며, `typeorm-transactional`이 참조하는 `EntityManager.connection` 프로퍼티 역시 하위 호환 getter로 유지되고 있어 런타임 부작용 없이 업그레이드가 가능함을 확인하였습니다.

### 기대 효과 및 영향 (Consequences)

* **장점**:
  - ES2023 네이티브 컴파일 환경에 부합하는 최신 TypeORM 1.1.1 적용.
  - 레거시 0.3 대비 쿼리 러너 메모리 누수 방지 및 트랜잭션 안정성 개선.
  - Dependabot의 최신 보안 권장 사양 충족.
* **단점**:
  - `package.json`의 peerDependencies 경고 가능성 (필요 시 pnpm 세팅 확인).
  - 24개 E2E 테스트를 통한 데이터베이스 쓰기/조회/트랜잭션 전수 검증 필요.

### 구현 검증 계획 (Confirmation)

* 애플리케이션 시작 검증: `pnpm run start` 시 TypeORM Data Source 연결 및 동기화 확인.
* E2E 통합 검증: `pnpm run test:e2e` 실행으로 Testcontainers Postgres 환경에서 CRUD, 페이지네이션, `@Transactional()` 트랜잭션 롤백/커밋 106개 테스트 100% 통과 확인.
* 타입 및 린트 검증: `pnpm run typecheck`, `pnpm run lint` 0건 확인.

## 참고 및 관련 정보 (More Information)

* [TypeORM Official Documentation](https://typeorm.io)
* [TypeORM GitHub Releases (v1.0.0, v1.1.1)](https://github.com/typeorm/typeorm/releases)
