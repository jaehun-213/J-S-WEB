# Firebase 보안 규칙 설정 가이드

## ⚠️ 중요: 현재 `permission-denied` 오류가 발생하고 있습니다!

이 오류는 Firestore 보안 규칙이 설정되지 않았거나 잘못 설정되었을 때 발생합니다.
아래 단계를 따라 Firestore 보안 규칙을 설정하세요.

## 🔧 Firestore 보안 규칙 설정 방법

### 1단계: Firebase 콘솔 접속

1. https://console.firebase.google.com 접속
2. 프로젝트 `jns-web` 선택 (또는 설정한 프로젝트 이름)

### 2단계: Firestore Database로 이동

1. 좌측 메뉴에서 **"Firestore Database"** 클릭
2. 상단 탭에서 **"규칙"** 탭 클릭

### 3단계: 보안 규칙 입력

다음 규칙을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 공개용 게시판: 누구나 읽을 수 있음
    match /quoteRequests_public/{docId} {
      allow read: if true;
      allow write: if true;
    }
    
    // 비공개 상세정보: 관리자만 읽을 수 있음
    match /quoteRequests_private/{docId} {
      allow read, update, delete: if request.auth != null;
      allow create: if true;
    }
  }
}
```

### 4단계: 규칙 게시

1. **"게시"** 버튼 클릭
2. 확인 대화상자에서 **"게시"** 클릭
3. 규칙이 적용되는 데 몇 초 정도 걸릴 수 있습니다

## 🔒 Firebase Storage 보안 규칙 설정

### 1단계: Storage로 이동

1. 좌측 메뉴에서 **"Storage"** 클릭
2. 상단 탭에서 **"규칙"** 탭 클릭

### 2단계: 보안 규칙 입력

다음 규칙을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /quotes/{quoteId}/{fileName} {
      // 읽기: 관리자만 가능
      allow read: if request.auth != null;
      // 쓰기: 누구나 가능 (폼 제출 시)
      allow write: if true;
    }
  }
}
```

### 3단계: 규칙 게시

1. **"게시"** 버튼 클릭
2. 확인 대화상자에서 **"게시"** 클릭

## ✅ 설정 확인 방법

### 1. 브라우저 콘솔 확인

1. `quote-list.html` 페이지 열기
2. F12 키를 눌러 개발자 도구 열기
3. "Console" 탭 확인
4. 오류 메시지가 없어야 합니다

### 2. firebase-debug.html 확인

1. `firebase-debug.html` 페이지 열기
2. **"Firestore 연결 테스트"** 버튼 클릭
3. **"데이터 읽기 테스트"** 버튼 클릭
4. **"데이터 쓰기 테스트"** 버튼 클릭
5. 모두 성공 메시지가 나와야 합니다

## 🚨 문제 해결

### 여전히 `permission-denied` 오류가 발생하는 경우

1. **규칙이 제대로 게시되었는지 확인**
   - Firebase 콘솔에서 규칙 탭을 다시 확인
   - 규칙 코드가 올바르게 입력되어 있는지 확인
   - "게시" 버튼을 다시 클릭

2. **Firestore Database가 생성되었는지 확인**
   - Firestore Database 메뉴에서 "데이터베이스 만들기"가 보이면 생성되지 않은 것
   - "데이터베이스 만들기"를 클릭하고 "프로덕션 모드에서 시작" 선택
   - 위치는 `asia-northeast3 (Seoul)` 권장

3. **브라우저 캐시 삭제**
   - Ctrl + Shift + Delete (Windows) 또는 Cmd + Shift + Delete (Mac)
   - 캐시된 이미지 및 파일 선택
   - 삭제 후 페이지 새로고침

4. **Firebase 프로젝트 확인**
   - `firebase-config.js` 파일의 `projectId`가 `jns-web`인지 확인
   - Firebase 콘솔에서 프로젝트 이름이 일치하는지 확인

## 📝 규칙 설명

### Firestore 규칙

- `quoteRequests_public`: 누구나 읽고 쓸 수 있음 (공개 게시판)
- `quoteRequests_private`: 관리자만 읽을 수 있지만, 누구나 생성 가능 (폼 제출)

### Storage 규칙

- `quotes/{quoteId}/{fileName}`: 관리자만 읽을 수 있지만, 누구나 업로드 가능 (폼 첨부파일)

## 🔐 보안 권장사항

현재 규칙은 개발/테스트 단계용입니다. 프로덕션 환경에서는 다음을 고려하세요:

1. **Cloud Functions 사용**: 폼 제출을 Cloud Functions로 처리하여 서버 측에서 검증
2. **Rate Limiting**: Firebase App Check 등을 사용하여 스팸 방지
3. **파일 크기 제한**: Storage 규칙에서 파일 크기 제한 추가
4. **API 키 제한**: Firebase 콘솔에서 API 키에 도메인 제한 설정

## 📞 추가 도움말

- Firebase 공식 문서: https://firebase.google.com/docs/firestore/security/get-started
- Firestore 보안 규칙 시뮬레이터: Firebase 콘솔 > Firestore > 규칙 > 시뮬레이터


