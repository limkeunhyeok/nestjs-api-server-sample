# DDD & Hexagonal 아키텍처 구조 표준 사양서 (Architecture Specification)

본 문서는 프로젝트의 모든 모듈에 일관되게 적용되는 클린 DDD(도메인 주도 설계) 및 헥사고날(Ports & Adapters) 아키텍처의 디렉토리 구조 및 레이어별 역할 표준 사양을 기술합니다.

---

## 1. 아키텍처 지향 표준 디렉토리 구조 (Directory Tree)

모든 비즈니스 모듈(`src/modules/<domain-model>/`)은 다음과 같은 초정밀 서브디렉토리 표준에 따라 구성되어야 합니다:

```text
src/modules/<domain-model>/
│
├── application/             # Use Case 계층 (도메인을 조합하여 비즈니스 기능 수행)
│   ├── dto/                 # Application DTO (유스케이스 입력 검증 데이터 구조)
│   ├── services/            # Application Service (Use Case 및 트랜잭션 경계 제어)
│   ├── ports/               # Inbound / Outbound Port Interface
│   └── mappers/             # DTO ↔ Domain 변환 맵퍼
│
├── domain/                  # 핵심 비즈니스 로직 (Framework Independent - 순수 TypeScript)
│   ├── entities/            # Domain Entity (데이터와 도메인 행동을 내포한 클래스)
│   ├── value-objects/       # Value Object (스스로 무결성을 검증하는 불변 값 객체)
│   ├── repositories/        # Repository Port Interface (인프라를 격리하는 포트)
│   ├── services/            # Domain Service (복수 엔티티에 걸친 비즈니스 도메인 서비스)
│   ├── events/              # Domain Event
│   ├── factories/           # Domain Factory
│   ├── specifications/      # Specification Pattern
│   └── exceptions/          # Domain Exception (BaseDomainException 상속 개별 예외)
│
├── infrastructure/          # 외부 기술 구현 계층
│   ├── persistence/
│   │   ├── entities/        # DB Entity (TypeORM ORM Entity 스키마 정의)
│   │   ├── repositories/    # Repository Adapter (포트를 구현하고 DB를 감추는 구현체)
│   │   ├── mappers/         # Domain ↔ Persistence 변환 매퍼
│   │   └── migrations/      # DB Migration
│   │
│   ├── cache/               # Redis 등 Cache 구현
│   ├── clients/             # 외부 API Client
│   ├── messaging/           # Kafka, RabbitMQ 등
│   └── storage/             # S3, Local Storage 등
│
├── presentation/            # REST API 계층 (외부 진입점)
│   ├── controllers/         # REST Controller (라우팅 및 HTTP 응답 처리)
│   ├── requests/            # Request DTO (Zod 스키마 등을 통한 요청 유효성 검증)
│   ├── responses/           # Response DTO (클라이언트에 반환될 응답 구조 표준)
│   ├── presenters/          # Domain → Response 변환용 프레젠터
│   └── serializers/         # 응답 직렬화(Serialization) 가공
│
└── <domain-model>.module.ts # Domain Module (포트와 어댑터를 바인딩하고 모듈 설정 정의)
```

---

## 2. 레이어별 주요 정체성 및 제약 규칙

### 2.1. 도메인 레이어 (`domain/`)
* **순수성 보장 (Domain Purity)**: `@nestjs/common`, `@nestjs/typeorm`, `typeorm` 등 어떠한 프레임워크나 ORM 라이브러리 데코레이터도 임포트되어서는 안 됩니다.
* **행동 지향**: 도메인 엔티티(`domain/entities/`)는 데이터 바구니(Anemic)가 아니어야 합니다. 비즈니스 상태 변화 정책을 수행하는 도메인 행위 메서드(Rich Method)를 포함해야 합니다.
* **값 객체(VO) 활용**: 이메일, 패스워드 해시 등 생성 시 유효성과 형식을 스스로 검증해야 하는 데이터는 불변 값 객체(`domain/value-objects/`)로 도출하여 데이터 무결성을 강제합니다.

### 2.2. 애플리케이션 레이어 (`application/`)
* **비즈니스 흐름 제어**: 유스케이스 서비스는 영속성 포트 인터페이스를 주입받아 도메인을 로드하고, 도메인의 행동 메서드를 호출한 뒤, 상태가 변한 도메인을 포트를 통해 저장하는 오케스트레이션 역할에 집중합니다.
* **트랜잭션 관리**: 상태를 수정하는 모든 Command 유스케이스는 `@Transactional()`을 적용하여 단일 작업 원자성을 강제합니다.

### 2.3. 인프라스트럭처 레이어 (`infrastructure/`)
* **기술 세부 은닉**: 실제 TypeORM Entity 및 Repository와 상호작용하는 모든 코드는 `infrastructure/persistence/` 하위에 위치합니다.
* **Mapper의 강제**: 서비스 및 도메인으로 `OrmEntity`가 절대 유출되어서는 안 되며, 어댑터 내부에서 영속화와 조회를 수행할 때 반드시 static 메서드를 포함한 `Mapper` 클래스를 사용해 상호 변환(`toDomain()`, `toOrm()`)을 거쳐 은닉해야 합니다.

### 2.4. 프레젠테이션 레이어 (`presentation/`)
* **직렬화 호환 및 데이터 은닉**: 컨트롤러는 응답을 반환할 때 비즈니스 도메인 인스턴스를 날것 그대로 반환해서는 안 됩니다. 반드시 전용 응답 DTO(`presentation/responses/`)를 생성하여 필요한 필드만 정제해 내보냅니다.
* **캐싱 Plain 객체 호환**: 캐시 가드로부터 반환된 JSON Plain 객체와 인스턴스 객체 모두에서 데이터를 정상적으로 추출할 수 있도록 strict 한 맵퍼 가드를 DTO 내부에 반영해야 합니다.

---

## 3. 예외 처리 가이드라인

* 도메인 및 서비스에서는 NestJS의 `HttpException` 계열(`BadRequestException`, `NotFoundException` 등)을 임포트하거나 던지지 않습니다.
* 모든 비즈니스 예외는 `BaseDomainException`을 상속한 커스텀 도메인 예외를 선언해 던지며, 전역 `AllExceptionsFilter`에서 예외 유형을 파악하여 알맞은 HTTP Status(400, 404, 403 등)로 일원화 매핑하여 클라이언트에 출력합니다.
