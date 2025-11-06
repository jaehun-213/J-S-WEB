# 견적서 "문서 없음" 오류 진단 가이드

## 문제 상황
admin 모드로 로그인 후 `quote-detail.html`에서 "상세 정보를 찾을 수 없습니다. (문서 없음)" 오류 발생
- 문서 ID: `test-1762343555768`

## 단계별 진단 방법

### 1단계: 브라우저 콘솔에서 로그 확인

1. **브라우저 개발자 도구 열기**
   - `F12` 키 누르기
   - 또는 `Ctrl + Shift + I` (Windows) / `Cmd + Option + I` (Mac)

2. **Console 탭 확인**
   - `quote-detail.html` 페이지를 열면 자동으로 디버깅 로그가 출력됩니다.
   - 다음 정보를 확인하세요:
     ```
     === quote-detail.html 디버깅 시작 ===
     URL 파라미터: ?id=test-1762343555768
     추출된 문서 ID: test-1762343555768
     --- Public 데이터 조회 시작 ---
     문서 존재 여부 (doc.exists): true/false
     --- Private 데이터 조회 시작 ---
     문서 존재 여부 (doc.exists): true/false
     ```

3. **로그에서 확인할 사항**
   - Public 문서가 존재하는가? (`doc.exists: true/false`)
   - Private 문서가 존재하는가? (`doc.exists: true/false`)
   - 실제 존재하는 문서 ID 목록은 무엇인가?
   - Public과 Private의 ID가 일치하는가?

### 2단계: Firestore 콘솔에서 실제 데이터 확인

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com 접속
   - 프로젝트 선택: `jns-web`

2. **Firestore Database 확인**
   - 왼쪽 메뉴에서 "Firestore Database" 클릭
   - 두 개의 컬렉션 확인:
     - `quoteRequests_public`
     - `quoteRequests_private`

3. **데이터 확인 사항**
   - `quoteRequests_public` 컬렉션에 `test-1762343555768` ID의 문서가 있는가?
   - `quoteRequests_private` 컬렉션에 `test-1762343555768` ID의 문서가 있는가?
   - 두 컬렉션의 문서 ID가 일치하는가?

### 3단계: 문제 원인 파악

#### 원인 1: Public에는 있지만 Private에는 없음
**증상**: 
- Public 문서는 존재
- Private 문서는 존재하지 않음
- 콘솔 로그: "Public에는 있지만 Private에는 없는 ID: [...]"

**원인**: 
- 데이터 저장 시 Batch 작업이 부분적으로 실패
- 또는 이전 버전의 코드로 저장된 데이터

**해결 방법**:
- 새로운 견적 요청을 제출하여 정상 작동 확인
- 기존 데이터는 수동으로 삭제하거나 마이그레이션 필요

#### 원인 2: ID가 잘못 전달됨
**증상**:
- URL 파라미터의 ID와 실제 Firestore의 ID가 다름
- 콘솔 로그에서 "존재하는 문서 ID 목록"과 전달된 ID가 다름

**원인**:
- `quote-list.html`에서 잘못된 ID로 링크 생성
- URL 인코딩 문제

**해결 방법**:
- `quote-list.html`의 링크 생성 로직 확인 (이미 수정됨)
- URL 인코딩 적용 확인

#### 원인 3: 데이터가 아예 없음
**증상**:
- Public 문서도 존재하지 않음
- Firestore에 해당 ID의 문서가 없음

**원인**:
- 데이터가 삭제됨
- 잘못된 ID

**해결 방법**:
- `quote-list.html`에서 올바른 ID로 링크가 생성되는지 확인
- 새로운 견적 요청 제출

### 4단계: 해결 방법

#### 방법 1: 새로운 견적 요청 제출 (권장)
1. `support.html`에서 새로운 견적 요청 제출
2. `quote-list.html`에서 새로 생성된 항목 클릭
3. 정상 작동하는지 확인

#### 방법 2: 기존 데이터 수정 (Firebase 콘솔)
1. Firebase 콘솔에서 `quoteRequests_public` 컬렉션 확인
2. 존재하는 문서 ID 확인
3. `quoteRequests_private` 컬렉션에 동일한 ID로 데이터 생성
   - 또는 Public 문서 삭제

#### 방법 3: 데이터 마이그레이션 스크립트 실행
```javascript
// Firebase 콘솔 > Firestore > 데이터 탭에서 실행
// 주의: 이 스크립트는 수동으로 실행해야 합니다.

// 1. Public 컬렉션의 모든 문서 ID 가져오기
// 2. 각 ID에 대해 Private 컬렉션 확인
// 3. Private에 없는 경우, Public 문서 삭제 또는 알림
```

## 예상되는 로그 출력 예시

### 정상 케이스
```
=== quote-detail.html 디버깅 시작 ===
추출된 문서 ID: abc123xyz456
--- Public 데이터 조회 시작 ---
문서 존재 여부 (doc.exists): true
--- Private 데이터 조회 시작 ---
인증된 사용자: admin@example.com
문서 존재 여부 (doc.exists): true
✅ 데이터 로드 성공
```

### 문제 케이스 1: Private 문서 없음
```
=== quote-detail.html 디버깅 시작 ===
추출된 문서 ID: test-1762343555768
--- Public 데이터 조회 시작 ---
문서 존재 여부 (doc.exists): true
--- Private 데이터 조회 시작 ---
인증된 사용자: admin@example.com
문서 존재 여부 (doc.exists): false
⚠️ Private 문서가 존재하지 않습니다!
존재하는 Public 문서 ID 목록: [...]
존재하는 Private 문서 ID 목록: [...]
⚠️ Public에는 있지만 Private에는 없는 ID: [test-1762343555768]
```

### 문제 케이스 2: Public 문서도 없음
```
=== quote-detail.html 디버깅 시작 ===
추출된 문서 ID: test-1762343555768
--- Public 데이터 조회 시작 ---
문서 존재 여부 (doc.exists): false
⚠️ Public 문서가 존재하지 않습니다!
존재하는 문서 ID: [다른 ID들...]
```

## 다음 단계

1. **브라우저 콘솔 로그 확인** (가장 중요!)
2. **Firebase 콘솔에서 실제 데이터 확인**
3. **로그 결과를 바탕으로 원인 파악**
4. **위의 해결 방법 중 적절한 방법 선택**

## 추가 도움말

문제가 계속되면 다음 정보를 수집하세요:
1. 브라우저 콘솔의 전체 로그 (스크린샷 또는 복사)
2. Firebase 콘솔의 Firestore 데이터 스크린샷
3. 발생한 오류 메시지 전체

이 정보를 바탕으로 더 정확한 진단이 가능합니다.

