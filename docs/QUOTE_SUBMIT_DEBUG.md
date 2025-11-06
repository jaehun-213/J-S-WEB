# 견적서 제출 문제 진단 가이드

## 문제: 견적서 제출 시 콘솔 로그가 없고 업데이트가 안됨

## 단계별 진단 방법

### 1단계: 페이지 로드 시 콘솔 확인

1. **`support.html` 페이지 열기**
2. **브라우저 개발자 도구 열기** (F12)
3. **Console 탭 확인**
4. **다음 로그가 표시되어야 함:**

```
✅ Firebase 초기화 완료
✅ Firestore 초기화 완료
✅ Storage 초기화 완료
✅ Authentication 초기화 완료
✅ submitEstimateForm 함수가 전역 스코프에 등록되었습니다.
=== support.html 스크립트 로드 확인 ===
submitEstimateForm 함수: ✅ 로드됨
firebase: ✅
db: ✅
storage: ✅
✅ 견적 요청 폼 찾음
```

### 2단계: 폼 제출 시 콘솔 확인

1. **견적서 작성 후 제출 버튼 클릭**
2. **콘솔에서 다음 로그 확인:**

**정상적인 경우:**
```
폼 제출 이벤트 발생!
이벤트 타입: submit
submitEstimateForm 함수 존재: true
=== 견적 요청 폼 제출 시작 ===
폼 요소: <form>...</form>
함수 호출 확인됨
폼 데이터 수집 시작...
수집된 폼 데이터: {name: "...", contact: "...", ...}
필수 필드 검증 시작...
Firebase 초기화 확인 중...
firebase: ✅
db: ✅
storage: ✅
✅ Firebase 초기화 확인 완료
생성된 문서 ID: [문서ID]
Batch 커밋 시작...
✅ Batch 커밋 완료
✅ Public 문서 저장 확인 완료: {...}
✅ Public/Private 데이터가 동일한 ID로 성공적으로 저장되었습니다: [문서ID]
```

### 3단계: 문제 진단

#### 문제 1: 함수가 로드되지 않음

**증상:**
```
submitEstimateForm 함수: ❌ 로드되지 않음
```

**원인:**
- `firebase-quote.js` 파일이 로드되지 않음
- 파일 경로가 잘못됨
- 스크립트 로드 오류

**해결 방법:**
1. Network 탭에서 `firebase-quote.js` 파일이 로드되었는지 확인
2. 파일이 404 오류인지 확인
3. 파일 경로가 올바른지 확인

#### 문제 2: 폼 제출 이벤트가 발생하지 않음

**증상:**
- "폼 제출 이벤트 발생!" 로그가 없음
- 제출 버튼을 클릭해도 아무 반응이 없음

**원인:**
- HTML5 `required` 속성 때문에 브라우저 기본 검증 실패
- 필수 필드가 비어있음

**해결 방법:**
1. 모든 필수 필드가 채워져 있는지 확인
2. 브라우저 기본 검증 메시지가 표시되는지 확인
3. 필수 필드:
   - 견적 제목
   - 회사명/성함
   - 연락처
   - 이메일
   - 문의 내용 (상세)
   - 개인정보 동의 체크박스

#### 문제 3: Firebase 초기화 실패

**증상:**
```
Firebase 초기화 확인 중...
firebase: ❌
db: ❌
storage: ❌
❌ Firebase 초기화 실패
```

**원인:**
- Firebase SDK가 로드되지 않음
- `firebase-config.js` 파일 오류
- 네트워크 문제

**해결 방법:**
1. Network 탭에서 Firebase SDK 파일들이 로드되었는지 확인
2. `firebase-config.js` 파일의 설정값 확인
3. 브라우저 콘솔에서 Firebase 초기화 오류 확인

#### 문제 4: Batch 커밋 실패

**증상:**
```
Batch 커밋 시작...
❌ 오류 발생
```

**원인:**
- Firestore 보안 규칙 문제
- 네트워크 문제
- 권한 문제

**해결 방법:**
1. Firebase 콘솔에서 Firestore 보안 규칙 확인
2. `quoteRequests_public`과 `quoteRequests_private` 컬렉션에 쓰기 권한이 있는지 확인
3. 브라우저 콘솔의 오류 메시지 확인

### 4단계: 수동 테스트

#### 테스트 1: 함수 직접 호출

브라우저 콘솔에서 다음 명령어 실행:

```javascript
// 함수가 정의되어 있는지 확인
console.log('submitEstimateForm:', typeof submitEstimateForm);

// 폼 요소 찾기
const form = document.querySelector('form[onsubmit*="submitEstimateForm"]');
console.log('폼:', form);

// 함수 직접 호출 테스트 (주의: 실제 제출은 안됨)
if (form && typeof submitEstimateForm === 'function') {
    console.log('함수 호출 가능');
} else {
    console.error('함수 호출 불가능');
}
```

#### 테스트 2: Firebase 연결 확인

브라우저 콘솔에서 다음 명령어 실행:

```javascript
console.log('firebase:', typeof firebase);
console.log('db:', typeof db);
console.log('storage:', typeof storage);

// Firestore 연결 테스트
if (typeof db !== 'undefined') {
    db.collection('quoteRequests_public').limit(1).get()
        .then(snapshot => {
            console.log('✅ Firestore 연결 성공:', snapshot.size, '개 문서');
        })
        .catch(error => {
            console.error('❌ Firestore 연결 실패:', error);
        });
}
```

### 5단계: 일반적인 해결 방법

1. **페이지 강력 새로고침**
   - Windows: `Ctrl + Shift + R` 또는 `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **브라우저 캐시 삭제**
   - 개발자 도구 (F12) → Network 탭
   - "Disable cache" 체크
   - 페이지 새로고침

3. **다른 브라우저에서 테스트**
   - Chrome, Firefox, Edge 등에서 테스트

4. **스크립트 로드 순서 확인**
   - `firebase-config.js`가 `firebase-quote.js`보다 먼저 로드되어야 함
   - 현재 순서: Firebase SDK → firebase-config.js → firebase-quote.js ✅

### 6단계: 추가 디버깅

문제가 계속되면 다음 정보를 수집하세요:

1. **브라우저 콘솔의 전체 로그** (스크린샷 또는 복사)
2. **Network 탭의 스크립트 로드 상태** (스크린샷)
3. **발생한 오류 메시지 전체**
4. **브라우저 및 OS 정보**

## 예상되는 정상 작동 흐름

1. 페이지 로드 → 스크립트 로드 → 함수 등록
2. 사용자가 폼 작성 → 제출 버튼 클릭
3. 브라우저 기본 검증 통과
4. `submitEstimateForm` 함수 호출
5. 폼 데이터 수집 및 검증
6. Firebase 초기화 확인
7. 문서 ID 생성
8. 파일 업로드 (있는 경우)
9. Batch로 Public/Private 데이터 저장
10. 저장 확인
11. 성공 메시지 및 리디렉션

## 다음 단계

위의 단계를 따라 진단한 후, 콘솔에 표시된 로그를 확인하여 어느 단계에서 문제가 발생하는지 파악하세요.

