# AI Dining Plan 웹앱 개발 명세서

## 1. 프로젝트 개요

### 1.1 프로젝트명
**AI Dining Plan**

### 1.2 한 줄 소개
사용자의 현재 위치와 자연어/선택형 요구사항을 분석하여 주변의 실제 맛집을 검색하고, GPT가 장소를 분석해 **식사 → 카페 등으로 이어지는 맞춤형 Dining Plan**을 만들어 주는 AI 맛집 추천 웹앱.

### 1.3 프로젝트 목적
단순히 주변 맛집 하나를 추천하는 것이 아니라 다음 과정을 하나의 서비스로 구현한다.

> 사용자 요구 입력 → GPT 요구사항 분석 → Kakao API 장소 검색 → GPT 분석 → 식사·카페 Plan 생성 → Kakao Map 시각화

이번 프로젝트에서는 **Kakao API를 외부 연동 API**, **OpenAI GPT를 LLM**으로 사용한다.

---

## 2. 프로젝트 범위

### 2.1 개발 기간
- **1일 / 총 8시간**
- 개인 온라인 실습 과정
- AI Coding Agent를 활용한 바이브코딩 방식

### 2.2 MVP 원칙
8시간 안에 실제로 동작하는 웹앱을 완성하는 것을 목표로 한다.

### 반드시 구현
1. 자연어 입력
2. 주요 조건 선택
3. 현재 위치 확인
4. Kakao Local API를 이용한 주변 장소 검색
5. Kakao Map에 장소 표시
6. GPT를 이용한 사용자 요구사항 분석
7. GPT를 이용한 장소 추천 및 추천 이유 생성
8. 식사 + 카페 중심의 간단한 Dining Plan 생성
9. Plan을 지도와 카드 형태로 표시
10. 기본 오류 처리
11. GitHub 저장소 등록 및 Vercel 배포

### MVP에서 제외
- 회원가입/로그인
- 서버 DB
- 결제
- 리뷰 작성
- 복잡한 개인화 학습
- 관리자 페이지
- 직접 크롤링 코드 작성
- 복잡한 추천 알고리즘
- 다중 LLM
- 실시간 예약/주문

### 선택적 고도화
- OpenAI Web Search를 활용한 장소 정보 보강
- 추천 근거 표시
- 맛집 후보 비교
- Plan 장소 변경
- 최근 검색/Plan LocalStorage 저장

---

## 3. 핵심 서비스 컨셉

### 3.1 기존 맛집 검색과의 차이
일반적인 맛집 검색은:
> 주변 맛집 검색 → 목록 표시

AI Dining Plan은:
> **내 상황 이해 → 주변 장소 검색 → 조건에 맞는 장소 선택 → 식사와 카페를 하나의 계획으로 구성**

핵심 메시지:

> **맛집을 찾아주는 AI가 아니라, 지금 내 상황에 맞는 '오늘의 식사 계획'을 만들어주는 AI**

---

## 4. 주요 사용자 시나리오

### 시나리오 A: 자연어 입력
사용자가 다음과 같이 입력한다.

> "아내와 청라에서 데이트하려고 해. 저녁은 맛있는 걸 먹고 조용한 카페에서 이야기하고 싶어. 7만원 정도 생각하고 있어."

AI는 입력에서 다음 조건을 추출한다.

```json
{
  "purpose": "데이트",
  "people": 2,
  "location": "청라",
  "meal": "저녁",
  "budget": 70000,
  "preferences": [
    "맛있는 음식",
    "조용한 카페"
  ],
  "plan": [
    "restaurant",
    "cafe"
  ]
}
```

그 후 주변 음식점과 카페를 검색하고 하나의 Plan으로 구성한다.

### 시나리오 B: 선택형 입력
자연어 입력이 어려운 사용자는 주요 조건을 선택한다.

**누구와?**
- 혼자
- 연인
- 친구
- 가족

**무엇을 할까요?**
- 식사
- 카페
- 술
- 산책

**중요 조건**
- 가까운 곳
- 가성비
- 주차
- 조용한 곳
- 분위기

**예산**
- 2만원 이하
- 5만원 이하
- 7만원 이하
- 10만원 이상

선택 결과는 GPT의 추천 조건으로 사용한다.

---

## 5. 핵심 기능 명세

### 5.1 사용자 요구사항 입력
사용자의 요구를 자연어 또는 선택형 조건으로 입력받는다.

예:
> "친구 3명과 저녁 먹고 카페에서 이야기하고 싶어요."

GPT가 추천에 사용할 구조화된 조건으로 변환한다.

```json
{
  "people": 3,
  "purpose": "친구 모임",
  "meal": "저녁",
  "plan": ["restaurant", "cafe"]
}
```

### 5.2 현재 위치 확인
브라우저 Geolocation API를 이용한다.

```text
[내 위치 사용하기]
       ↓
브라우저 위치 권한 요청
       ↓
latitude / longitude
       ↓
Kakao API 검색 중심점
```

위치 권한을 거부하면:
> 위치 정보를 사용할 수 없습니다. 검색할 지역을 입력해주세요.

---

## 6. Kakao API 연동

### 6.1 역할
Kakao Local API는 실제 장소 후보를 검색하는 데 사용한다.

Kakao Local API의 키워드 검색은 현재 위치 좌표, 반경, 정렬 등의 조건을 사용할 수 있으며 장소명, 주소, 좌표, 카테고리, 카카오맵 상세 URL 등의 정보를 제공한다.

공식 문서:
- https://developers.kakao.com/docs/ko/local/dev-guide

### 6.2 주요 검색

**음식점 검색**
- 검색어: 한식 / 중식 / 일식 / 양식 등
- 중심좌표: 사용자 현재 위치
- 반경: 예) 2km
- 정렬: 거리순

**카페 검색**
추천 식당이 결정된 경우 식당 좌표를 기준으로 주변 카페를 검색한다.
- 검색어: 카페
- 중심좌표: 추천 식당 좌표
- 반경: 예) 1km
- 정렬: 거리순

### 6.3 활용 데이터
```text
place_name
category_name
phone
address_name
road_address_name
x
y
distance
place_url
```

실제 API 응답 구조에 맞게 구현한다.

---

## 7. Kakao Map 연동

### 7.1 역할
Kakao Maps JavaScript SDK를 사용해 검색된 장소를 지도에 표시한다.

공식 문서:
- https://developers.kakao.com/docs/ko/kakaomap/common

### 7.2 지도 기능
- 사용자 위치를 중심으로 지도 표시
- 검색된 장소를 Marker로 표시
- Marker 클릭 시 장소명, 주소, 거리 등의 간단한 정보 표시

---

## 8. GPT 연동

### 8.1 GPT의 역할
1. 사용자 자연어 분석
2. 사용자 요구사항 구조화
3. 장소 후보 비교
4. 추천 이유 생성
5. 식사 + 카페 Plan 생성

---

## 9. AI 추천 로직

### 9.1 기본 흐름
```text
사용자 입력
    ↓
GPT
    ↓
요구사항 구조화
    ↓
Kakao API
    ↓
주변 장소 후보
    ↓
GPT
    ↓
후보 비교
    ↓
추천 장소 선정
    ↓
주변 카페 검색
    ↓
GPT
    ↓
Dining Plan 생성
```

### 9.2 추천 원칙
GPT는 Kakao API에서 제공받은 정보를 우선적으로 활용한다.

**중요:** GPT가 제공받지 않은 사실을 임의로 만들어내지 않는다.

예:
- 주차 가능 여부를 확인할 수 없으면 '주차 가능'이라고 단정하지 않는다.
- 가격 정보가 없으면 임의의 가격을 생성하지 않는다.
- 분위기 정보가 없으면 사실처럼 단정하지 않는다.

---

## 10. OpenAI Web Search 선택 기능

### 10.1 목적
Kakao API가 제공하지 않는 추가 장소 정보를 확인할 필요가 있을 경우 OpenAI의 Web Search 기능을 사용할 수 있다.

예:
```text
Kakao API
→ A식당 / 한식 / 거리 650m / 주소 / 좌표

Web Search
→ A식당 공식 홈페이지 / 메뉴 / 공개 장소 정보 / 공개 리뷰

GPT
→ 사용자 조건 + Kakao 정보 + 검색 정보
→ 추천 이유 생성
```

### 10.2 8시간 과정의 구현 범위
직접 크롤러를 개발하지 않는다.

```text
Kakao API
    ↓
맛집 후보 5~10개
    ↓
GPT가 우선 후보 선정
    ↓
선정된 소수 후보에 대해 Web Search
    ↓
GPT 분석
```

웹 검색은 MVP에 포함할 수 있지만 시간 부족 시 생략 가능한 선택 기능으로 취급한다.

---

## 11. AI Dining Plan

### 11.1 핵심 차별화 기능
맛집 하나를 추천하는 대신 사용자의 상황에 맞는 간단한 식사 계획을 만든다.

예:
```text
💕 오늘의 데이트 Plan

18:30
🍝 저녁
A 레스토랑

       ↓ 도보 이동

20:00
☕ 카페
B Coffee
```

### 11.2 Plan 구성
MVP에서는 최대 2단계로 제한한다.

```text
Restaurant → Cafe
```

향후 확장:
```text
Restaurant
    ↓
Cafe
    ↓
Walk / Activity
```

---

## 12. 추천 결과 화면

### 12.1 AI 추천 카드
```text
┌─────────────────────────────┐
│ ⭐ AI 추천                  │
│                             │
│ A 레스토랑                  │
│ 한식                        │
│ 📍 650m                     │
│                             │
│ 추천 이유                   │
│ 현재 위치에서 가깝고        │
│ 사용자가 요청한 조건에      │
│ 적합한 후보입니다.          │
│                             │
│ [지도에서 보기]             │
└─────────────────────────────┘
```

### 12.2 카페 카드
```text
┌─────────────────────────────┐
│ ☕ 다음 장소                 │
│                             │
│ B Coffee                    │
│ 식당에서 가까운 카페         │
│                             │
│ [카페 변경]                 │
└─────────────────────────────┘
```

---

## 13. 추천 근거 표시

Web Search를 사용하는 경우:

```text
📌 추천 근거

✓ 현재 위치에서 650m
✓ 한식 음식점
✓ 공식 웹 정보 확인
✓ 공개 정보에서 관련 특징 확인

⚠️ 확인하지 못한 정보
주차 가능 여부는 확인되지 않았습니다.
```

AI의 생성 내용과 실제 확인된 정보를 구분한다.

---

## 14. Plan 지도 표시

Kakao Map에 Plan 장소를 함께 표시한다.

```text
        📍 식당
          │
          │
          ↓
        📍 카페
```

가능한 경우 두 장소 사이의 거리 정보를 함께 보여준다.

MVP에서는 실제 경로 선을 직접 구현하는 대신 장소 Marker와 거리 정보만 표시해도 된다.

---

## 15. Plan 변경

선택적 고도화 기능.

사용자가:
> "카페만 다른 곳으로 바꿔줘."

라고 입력하면 식당은 유지하고 카페만 다시 검색한다.

MVP 시간에 따라 생략 가능하다.

---

## 16. 화면 구성

### 화면 1. 홈 / 입력 화면
```text
AI Dining Plan

오늘 어떤 시간을 보내고 싶나요?

[자연어 입력]

예:
"친구들과 저녁 먹고 카페에서 이야기하고 싶어요."

[AI Plan 만들기]

또는

누구와?
[혼자] [연인] [친구] [가족]

원하는 것
[식사] [카페] [술] [산책]

중요 조건
[가까운 곳] [가성비] [주차] [조용한 곳]

[현재 위치 사용]
```

### 화면 2. 검색/분석 상태
```text
AI가 Plan을 만들고 있습니다.

✓ 요구사항 분석
✓ 주변 맛집 검색
✓ 추천 장소 분석
○ 카페 검색
○ Plan 생성
```

### 화면 3. 결과 화면
```text
AI Dining Plan

[지도]

🍽️ 식사
추천 식당

↓

☕ 카페
추천 카페

[추천 이유]
[추천 근거]
```

---

## 17. 기술 스택

| 영역 | 기술 | 선정 이유 |
|---|---|---|
| Frontend | React + Vite + TypeScript | 8시간 개인 프로젝트에서 빠르게 구현하고 구조를 이해하기 쉬움 |
| Styling | Tailwind CSS | AI Coding Agent로 UI를 빠르게 구현하기 좋음 |
| State | React useState / useContext | 8시간 프로젝트에서 별도 상태관리 라이브러리가 없어도 충분함 |
| Location | Browser Geolocation API | 별도 위치 API 없이 현재 위도/경도 확보 가능 |
| External API | Kakao Local REST API | 실제 주변 장소 검색 |
| Map | Kakao Maps JavaScript SDK | 실제 장소 Marker와 Plan 시각화 |
| LLM | OpenAI GPT API | 자연어 분석, 장소 비교, 추천, Plan 생성 |
| Web Search | OpenAI Web Search | 필요 시 장소 추가 정보 검색 |
| Backend/API | Vercel Serverless Functions | OpenAI API Key 보호 및 서버 측 API 처리 |
| Storage | 없음 / 선택적으로 LocalStorage | DB 구현을 제외하고 핵심 기능에 집중 |
| Deployment | Vercel | 빠른 배포와 환경변수 관리 |
| Version Control | GitHub | 소스 관리 및 배포 연계 |

---

## 18. 보안 및 환경변수

### 예시
```env
KAKAO_REST_API_KEY=
VITE_KAKAO_JAVASCRIPT_KEY=
OPENAI_API_KEY=
```

### 원칙
- OpenAI API Key는 브라우저 코드에 노출하지 않는다.
- OpenAI 호출은 Serverless API Route를 통해 처리한다.
- Kakao REST API Key는 서버 측 호출 구조를 우선 고려한다.
- Kakao Maps JavaScript SDK에는 JavaScript 키를 사용한다.
- 실제 프로젝트의 환경변수명은 사용 중인 배포 구조에 맞게 조정한다.

---

## 19. 권장 프로젝트 구조

```text
ai-dining-plan/
├── public/
├── src/
│   ├── components/
│   │   ├── SearchForm.tsx
│   │   ├── PreferenceSelector.tsx
│   │   ├── PlaceCard.tsx
│   │   ├── DiningPlan.tsx
│   │   ├── KakaoMap.tsx
│   │   └── LoadingState.tsx
│   │
│   ├── services/
│   │   ├── kakaoService.ts
│   │   └── openaiService.ts
│   │
│   ├── types/
│   │   ├── place.ts
│   │   └── diningPlan.ts
│   │
│   ├── utils/
│   │   └── location.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── api/
│   └── recommend.ts
│
├── .env.local
├── package.json
└── README.md
```

실제 Vercel 프로젝트 구조에 맞춰 Serverless Function 위치는 배포 방식에 따라 조정할 수 있다.

---

## 20. 데이터 흐름

```text
[사용자]
자연어 / 선택 조건
        │
        ↓
[React]
        │
        ↓
[GPT]
요구사항 구조화
        │
        ↓
[Geolocation]
현재 위치
        │
        ↓
[Kakao Local API]
주변 장소 검색
        │
        ↓
[장소 후보]
        │
        ├─────────────┐
        ↓             ↓
[Kakao Map]       [GPT]
지도 표시          후보 분석
                      │
                [Web Search]
                선택적 추가 정보
                      │
                      ↓
                  GPT 최종 분석
                      │
                      ↓
                Dining Plan
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
       🍽️ 식사                  ☕ 카페
          │                       │
          └───────────┬───────────┘
                      ↓
                 최종 결과
```

---

## 21. API 역할 구분

| 기술 | 역할 |
|---|---|
| Browser Geolocation | 현재 위치 획득 |
| Kakao Local API | 실제 장소 검색 |
| Kakao Maps SDK | 지도 및 Marker |
| OpenAI GPT | 자연어 분석/추천/Plan |
| OpenAI Web Search | 추가 웹 정보 검색 |
| Vercel Serverless | 서버 측 API 처리 |
| React | 화면과 사용자 상호작용 |

핵심 원칙:

> **Kakao는 장소를 찾고, GPT는 사용자의 요구와 장소 정보를 이해하고, Kakao Map은 위치를 보여준다.**

---

## 22. 오류 처리

### 위치 권한 거부
> 현재 위치를 가져올 수 없습니다. 검색할 지역을 입력해주세요.

### Kakao API 오류
> 주변 장소 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.

### 검색 결과 없음
> 주변에서 조건에 맞는 장소를 찾지 못했습니다. 검색 범위를 넓혀보세요.

### OpenAI API 오류
> AI 분석을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.

### Web Search 정보 부족
> 해당 장소에 대한 충분한 추가 정보를 확인하지 못했습니다.

### AI 환각 방지
확인되지 않은 정보는 사실처럼 표현하지 않는다.

---

## 23. 8시간 개발 일정

### 1시간 — 기획 및 프로젝트 설정
- 서비스 이해
- React/Vite 프로젝트 생성
- 기본 UI
- API Key 설정

### 1.5시간 — Kakao API
- Kakao Developers 설정
- 장소 검색 API
- JSON 응답 이해
- 장소 목록 출력

### 1시간 — Kakao Map
- Kakao Maps SDK 연결
- 지도 표시
- Marker 표시
- 목록과 Marker 연동

### 1시간 — GPT
- OpenAI API 연결
- 자연어 요구사항 분석
- 구조화된 JSON 생성

### 1시간 — AI 추천
- Kakao 장소 후보 전달
- GPT 장소 비교
- 추천 장소 및 추천 이유 생성

### 1.5시간 — AI Dining Plan
- 추천 식당 선정
- 식당 주변 카페 검색
- 식당 + 카페 Plan 생성
- 지도에 Plan 표시

### 1시간 — 완성
- UI 개선
- 오류 처리
- GitHub Push
- Vercel 배포

---

## 24. 핵심 학습 목표

### ① 외부 API 활용
```text
React
 ↓
Kakao API
 ↓
JSON
 ↓
화면
```

### ② LLM API 활용
```text
사용자 자연어
 ↓
GPT
 ↓
구조화된 데이터
 ↓
서비스 로직
```

### ③ 복수 API 결합
```text
Kakao API + OpenAI API
          ↓
      하나의 서비스
```

### ④ AI 기반 서비스 설계
```text
사용자 요구
 ↓
AI 분석
 ↓
외부 데이터
 ↓
AI 판단
 ↓
서비스 결과
```

---

## 25. 성공 기준

8시간 종료 시 다음 시나리오가 실제로 동작해야 한다.

### 테스트 입력
> "친구 3명과 저녁 먹고 카페에서 이야기하고 싶어요."

### 기대 결과
1. GPT가 사용자 요구를 분석한다.
2. 현재 위치를 가져온다.
3. Kakao API에서 주변 음식점을 검색한다.
4. 음식점 후보가 화면에 표시된다.
5. Kakao Map에 Marker가 표시된다.
6. GPT가 후보 중 적합한 장소를 선정한다.
7. 선정된 식당 주변에서 카페를 검색한다.
8. GPT가 식당 + 카페 Plan을 구성한다.
9. 화면에 최종 Plan이 표시된다.
10. 지도에 식당과 카페가 함께 표시된다.

---

## 26. 향후 확장 기능

### AI
- 사용자 취향 학습
- 두 사람의 취향 결합
- 맛집 후보 자동 비교
- 추천 근거 상세화
- Web Search 기반 최신 정보 확인

### Plan
- 식사 → 카페 → 산책
- 데이트 코스
- 가족 외식 코스
- 친구 모임 코스
- Plan 재생성
- 특정 장소만 교체

### 사용자
- 최근 Plan
- 즐겨찾기
- Plan 공유
- 사용자 선호 저장

### Kakao
- 도보 경로
- 대중교통 경로
- 장소 상세 정보
- 길찾기 연동

---

## 27. 최종 제품 정의

### AI Dining Plan

**핵심 가치**

> **"맛집을 찾아주는 AI가 아니라, 지금 내 상황에 맞는 식사 계획을 만들어주는 AI"**

### 핵심 기술
```text
React + Vite + TypeScript
        +
Kakao Local API
        +
Kakao Maps
        +
OpenAI GPT
        +
OpenAI Web Search
        +
Vercel
```

### 핵심 사용자 경험
```text
"오늘 뭐 하지?"
      ↓
내 상황을 입력
      ↓
AI가 이해
      ↓
주변 실제 장소 검색
      ↓
AI가 비교
      ↓
🍽️ 식사
      ↓
☕ 카페
      ↓
🗺️ 지도
      ↓
오늘의 Dining Plan 완성
```

---

## 28. 공식 문서

- Kakao Local API: https://developers.kakao.com/docs/ko/local/dev-guide
- Kakao Map: https://developers.kakao.com/docs/ko/kakaomap/common
- Kakao JavaScript SDK: https://developers.kakao.com/docs/ko/javascript/getting-started
- OpenAI API: https://platform.openai.com/docs/

구현 시에는 각 API의 최신 공식 문서와 현재 계정별 사용 가능 기능을 기준으로 세부 호출 방식과 SDK 버전을 확인한다.
