---
status: accepted
date: 2026-07-05
decision-makers: [개발자, Antigravity]
---

# 0002 - 초정밀 클린 DDD 및 헥사고날 아키텍처 표준 디렉토리 구조 수립

## 맥락과 문제 정의 (Context and Problem Statement)

기존 리팩토링(ADR 0001) 과정에서 `domain`, `application`, `infrastructure`, `presentation` 물리 폴더 구조를 도입했으나, 각 레이어 하위의 세부 폴더 구조에 대한 엄격한 명세가 부재했습니다. 이로 인해 개발자와 AI 에이전트 간의 협업 및 신규 파일 생성 시 폴더 명명과 의존성 고립 수준에 파편화가 발생할 수 있는 리스크가 있습니다. 어떻게 프로젝트 전체에 일관되게 적용될 세부 디렉토리 구조 표준을 수립할 수 있을까요?

## 의사결정 동기 (Decision Drivers)

* **극대화된 도메인 격리**: 프레임워크 기술과 무관한 핵심 비즈니스 영역의 안전한 보존.
* **일관성 있는 코드 배치 규칙**: 복수의 개발자와 AI가 동일한 비즈니스 개념을 구현할 때 디렉토리 구성의 통일성 유지.
* **의존성 단방향 흐름 강제**: 인프라와 컨트롤러가 도메인을 안전하게 보호하며 단방향으로만 의존하도록 파일 단위 고립 보장.

## 검토한 대안들 (Considered Options)

* **대안 1 (기존 플랫한 레이어 구조)**: `domain/`, `application/`, `infrastructure/`, `presentation/` 4개 레이어 폴더만 두고 하위 파일들을 플랫하게 두는 방식.
* **대안 2 (초정밀 서브디렉토리 세분화 구조 - 선택안)**: 각 레이어 하위에 역할별 서브디렉토리(`value-objects`, `mappers`, `ports`, `entities`, `repositories` 등)를 초정밀로 세분화하여 책임을 격리하는 구조.

## 결정 내용 및 결과 (Decision Outcome)

선택한 안: **대안 2 (초정밀 서브디렉토리 세분화 구조)**

이유: 프로젝트의 규모가 커지거나 파일이 늘어나더라도, 각 레이어별 세부 역할이 디렉토리 이름 자체로 명시되므로 규칙 위반을 원천 방어하고 코드 가독성 및 응집도를 극대화할 수 있기 때문입니다.

### 기대 효과 및 영향 (Consequences)

* **장점**:
  * 비즈니스 코어(엔티티, VO, 도메인 서비스 등)의 물리적 책임 경계가 완벽히 구분됩니다.
  * AI 에이전트(Antigravity)와의 협업 시 폴더 생성이나 코드 배치 위치에 대한 모호성이 원천 제거됩니다.
  * 기술 데이터베이스(`OrmEntity`)와 도메인 데이터(`Domain Entity`), 외부 입출력 데이터(`DTO`)의 은닉과 매핑(Mapper) 지점이 명확하게 분할됩니다.
* **단점**:
  * 생성해야 하는 폴더와 파일(보일러플레이트) 수가 많아져 파일 관리 부담이 다소 늘어납니다.

### 구현 검증 계획 (Confirmation)

* **ADR 및 규칙 파일 동기화**: `.agents/AGENTS.md`에 본 구조 트리를 강제 린트 규칙으로 등록하고 바이브 코딩 시 상시 검증합니다.
* **코드 리뷰 체크리스트**: 신규 모듈 작성 시 표준 폴더 트리 구조와 매칭되는지 확인합니다.

## 참고 및 관련 정보 (More Information)

* 상세 구조 트리는 [아키텍처 표준 명세서(architecture-specification.md)](file:///Users/limkeunhyeok/Desktop/nestjs-api-server-sample/docs/specs/architecture-specification.md)에 상세히 기술하여 보존합니다.
