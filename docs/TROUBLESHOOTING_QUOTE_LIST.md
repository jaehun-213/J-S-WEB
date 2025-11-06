# 견적 현황 업데이트 문제 해결 가이드

## 문제: 견적 현황이 업데이트되지 않음

### 가능한 원인 및 해결 방법

## 1. Firestore 보안 규칙 확인 (가장 중요!)

### 문제
Firestore 보안 규칙에서 `quoteRequests_public` 컬렉션에 대한 읽기 권한이 없을 수 있습니다.

### 해결 방법

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com 접속
   - 프로젝트 선택: `jns-web`

2. **Firestore Database → 규칙 탭 이동**

3. **다음 규칙이 적용되어 있는지 확인:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 공개용 견적 목록: 누구나 읽을 수 있음
    match /quoteRequests_public/{docId} {
      allow read: if true;  // 모든 사용자가 읽기 가능
      allow write: if true; // 폼 제출 시 쓰기 가능 (더 강력한 보안은 Cloud Function 권장)
    }
    
    // 비공개 견적 상세: 관리자만 읽기 가능
    match /quoteRequests_private/{docId} {
      allow read: if request.auth != null;  // 로그인한 사용자만 읽기 가능
      allow write: if true; // 폼 제출 시 쓰기 가능
    }
  }
}
```

4. **규칙 게시**
   - "게시" 버튼 클릭
   - 규칙 적용까지 몇 초 소요될 수 있음

## 2. 브라우저 콘솔 확인

### 확인 사항

1. **브라우저 개발자 도구 열기** (F12)
2. **Console 탭 확인**
3. **다음 로그가 표시되는지 확인:**

```
✅ Firebase 초기화 완료
✅ Firestore 초기화 완료
견적 목록 로드 시작...
견적 목록 조회 완료: X개
```

### 오류가 있는 경우

- **`permission-denied`**: Firestore 보안 규칙 문제 (위 1번 참조)
- **`failed-precondition`**: 인덱스가 필요함 (아래 3번 참조)
- **`unavailable`**: 인터넷 연결 문제

## 3. Firestore 인덱스 생성

### 문제
`createdAt` 필드로 정렬하는 인덱스가 없을 수 있습니다.

### 해결 방법

1. **브라우저 콘솔에서 오류 확인**
   - `failed-precondition` 오류가 있는지 확인
   - 오류 메시지에 인덱스 생성 링크가 포함되어 있을 수 있음

2. **Firebase 콘솔에서 인덱스 생성**
   - Firestore Database → 인덱스 탭
   - "인덱스 만들기" 클릭
   - 컬렉션 ID: `quoteRequests_public`
   - 필드 추가:
     - `createdAt` (내림차순)
   - "만들기" 클릭
   - 인덱스 생성 완료까지 몇 분 소요될 수 있음

3. **또는 코드에서 자동 처리**
   - 현재 코드는 인덱스가 없어도 전체 조회 후 클라이언트에서 정렬하도록 되어 있음
   - 하지만 성능을 위해 인덱스 생성 권장

## 4. 데이터 저장 확인

### 확인 방법

1. **Firebase 콘솔 → Firestore Database → 데이터 탭**
2. **`quoteRequests_public` 컬렉션 확인**
   - 데이터가 실제로 저장되어 있는지 확인
   - 문서 ID와 제목이 올바른지 확인

3. **`quoteRequests_private` 컬렉션 확인**
   - Private 컬렉션에도 동일한 ID로 데이터가 있는지 확인

### 데이터가 없는 경우

- 견적 요청 폼 제출 시 오류가 발생했을 수 있음
- 브라우저 콘솔에서 오류 메시지 확인
- `firebase-quote.js`의 에러 처리 로그 확인

## 5. 캐시 문제

### 문제
브라우저 캐시로 인해 오래된 데이터가 표시될 수 있습니다.

### 해결 방법

1. **강력 새로고침**
   - Windows: `Ctrl + Shift + R` 또는 `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **브라우저 캐시 삭제**
   - 개발자 도구 (F12) → Network 탭
   - "Disable cache" 체크
   - 페이지 새로고침

## 6. 실시간 업데이트

### 현재 구현
- 페이지 로드 시 한 번만 데이터 조회
- 실시간 리스너 추가됨 (새 견적 추가 시 자동 갱신)

### 수동 새로고침
- 페이지를 새로고침하면 최신 목록이 표시됨
- 견적 제출 후 자동으로 `quote-list.html`로 리디렉션됨

## 7. 디버깅 체크리스트

### 단계별 확인

- [ ] Firebase 콘솔에서 Firestore 보안 규칙 확인
- [ ] 브라우저 콘솔에서 오류 메시지 확인
- [ ] Firebase 콘솔에서 실제 데이터 존재 확인
- [ ] `quoteRequests_public` 컬렉션에 데이터가 있는지 확인
- [ ] 문서의 `title` 필드가 올바른지 확인
- [ ] 문서의 `createdAt` 필드가 있는지 확인
- [ ] 브라우저 캐시 삭제 후 다시 시도
- [ ] 다른 브라우저에서 테스트

## 8. 추가 디버깅

### 콘솔 로그 확인

견적 제출 시 다음 로그가 표시되어야 합니다:

```
생성된 문서 ID: [문서ID]
Batch 커밋 시작...
✅ Batch 커밋 완료
✅ Public 문서 저장 확인 완료: {id: "...", title: "...", createdAt: ...}
✅ Public/Private 데이터가 동일한 ID로 성공적으로 저장되었습니다: [문서ID]
```

견적 목록 로드 시 다음 로그가 표시되어야 합니다:

```
견적 목록 로드 시작...
견적 목록 조회 완료: X개
조회된 견적 목록:
1. ID: [문서ID], 제목: [제목], 날짜: [날짜]
```

## 9. 문제가 계속되는 경우

다음 정보를 수집하여 확인하세요:

1. **브라우저 콘솔의 전체 로그** (스크린샷 또는 복사)
2. **Firebase 콘솔의 Firestore 데이터 스크린샷**
3. **Firestore 보안 규칙 스크린샷**
4. **발생한 오류 메시지 전체**

이 정보를 바탕으로 더 정확한 진단이 가능합니다.

