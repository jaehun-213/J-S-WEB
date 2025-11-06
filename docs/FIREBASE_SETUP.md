# Firebase 연동 설정 가이드

이 문서는 제이앤에스건설 웹사이트의 Firebase 연동 설정 방법을 안내합니다.

## 📋 사전 준비사항

1. Firebase 계정 생성 (https://firebase.google.com)
2. Firebase 프로젝트 생성

## 🔧 Firebase 프로젝트 설정

### 1단계: Firebase 프로젝트 생성 및 설정

1. Firebase 콘솔 (https://console.firebase.google.com) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "jands-construction")
4. Google Analytics 설정 (선택사항)

### 2단계: 웹 앱 추가

1. Firebase 프로젝트 대시보드에서 "웹" 아이콘 클릭 (</>)
2. 앱 닉네임 입력 (예: "J&S Website")
3. "Firebase Hosting도 설정" 체크 해제 (필요시 나중에 설정 가능)
4. "앱 등록" 클릭
5. **Firebase 구성 정보 복사** (다음 단계에서 사용)

### 3단계: firebase-config.js 파일 업데이트

`firebase-config.js` 파일을 열고 Firebase 콘솔에서 복사한 설정 정보로 교체:

```javascript
const firebaseConfig = {
  apiKey: "여기에_API_KEY_붙여넣기",
  authDomain: "여기에_AUTH_DOMAIN_붙여넣기",
  projectId: "여기에_PROJECT_ID_붙여넣기",
  storageBucket: "여기에_STORAGE_BUCKET_붙여넣기",
  messagingSenderId: "여기에_MESSAGING_SENDER_ID_붙여넣기",
  appId: "여기에_APP_ID_붙여넣기"
};
```

### 4단계: Firestore Database 설정

1. Firebase 콘솔에서 "Firestore Database" 메뉴 클릭
2. "데이터베이스 만들기" 클릭
3. "프로덕션 모드에서 시작" 선택
4. 위치 선택 (예: asia-northeast3 (Seoul))
5. "설정" 버튼 클릭

#### Firestore 보안 규칙 설정

Firestore Database > 규칙 탭에서 다음 규칙 추가:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 공개용 게시판: 누구나 읽을 수 있음
    match /quoteRequests_public/{docId} {
      allow read: if true;
      allow write: if true; // 폼 제출 시 생성 허용
    }
    
    // 비공개 상세정보: 관리자만 읽을 수 있음
    match /quoteRequests_private/{docId} {
      allow read, update, delete: if request.auth != null;
      allow create: if true; // 폼 제출 시 생성 허용
    }
  }
}
```

**⚠️ 중요:** 규칙을 추가한 후 "게시" 버튼을 클릭해야 적용됩니다.

### 5단계: Firebase Storage 설정

1. Firebase 콘솔에서 "Storage" 메뉴 클릭
2. "시작하기" 클릭
3. 보안 규칙 선택 (기본 규칙 사용)
4. 위치 선택 (Firestore와 동일한 위치 권장)

#### Storage 보안 규칙 설정

Storage > 규칙 탭에서 다음 규칙 추가:

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

**⚠️ 중요:** 규칙을 추가한 후 "게시" 버튼을 클릭해야 적용됩니다.

### 6단계: Firebase Authentication 설정

1. Firebase 콘솔에서 "Authentication" 메뉴 클릭
2. "시작하기" 클릭
3. "로그인 방법" 탭 클릭
4. "이메일/비밀번호" 활성화
5. "저장" 클릭

#### 관리자 계정 생성

1. "Authentication" > "사용자" 탭 클릭
2. "사용자 추가" 클릭
3. 이메일과 비밀번호 입력 (관리자 계정)
4. "사용자 추가" 클릭

**⚠️ 중요:** 관리자 이메일과 비밀번호를 안전하게 보관하세요.

## 📁 데이터 구조

### Firestore 컬렉션

#### quoteRequests_public (공개용)
- 모든 사용자가 읽을 수 있음
- 문서 필드:
  - `title` (string): 견적 요청 제목
  - `createdAt` (timestamp): 작성일시

#### quoteRequests_private (비공개용)
- 관리자만 읽을 수 있음
- 문서 필드:
  - `name` (string): 성함/회사명
  - `contact` (string): 연락처
  - `email` (string): 이메일
  - `businessArea` (string): 시공 분야
  - `location` (string): 시공 장소
  - `details` (string): 문의 내용
  - `fileUrls` (array): 첨부파일 다운로드 URL 배열
  - `createdAt` (timestamp): 작성일시

### Storage 구조

```
quotes/
  └── {문서ID}/
      ├── {파일명1}.jpg
      ├── {파일명2}.pdf
      └── ...
```

## 🚀 사용 방법

### 견적 요청 제출

1. `support.html` 페이지에서 견적 요청 폼 작성
2. 필수 항목 입력 (성함, 연락처, 이메일, 문의 내용)
3. 첨부파일 선택 (선택사항, 최대 3개)
4. "견적 요청하기" 버튼 클릭
5. Firebase에 데이터 자동 저장

### 견적 현황 확인

1. `quote-list.html` 페이지에서 접수된 견적 목록 확인
2. 목록에서 제목 클릭하여 상세 페이지 이동

### 관리자 로그인

1. `admin.html` 페이지 접속
2. 관리자 이메일과 비밀번호 입력
3. 로그인 성공 시 견적 상세 정보 확인 가능

## 🔒 보안 고려사항

1. **Firebase 설정 정보 보호**
   - `firebase-config.js` 파일은 클라이언트에 노출되지만, Firebase 보안 규칙으로 보호
   - API 키는 웹사이트 도메인에 제한 설정 권장

2. **관리자 계정 보안**
   - 강력한 비밀번호 사용
   - 정기적인 비밀번호 변경
   - Firebase Authentication에서 이중 인증 활성화 권장

3. **데이터 접근 제어**
   - Firestore 규칙을 통해 민감한 정보 보호
   - Storage 규칙을 통해 파일 접근 제어

## 📝 문제 해결

### 견적 요청이 저장되지 않는 경우

1. Firebase 콘솔에서 Firestore 규칙 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. `firebase-config.js` 파일의 설정 정보 확인

### 파일 업로드가 안 되는 경우

1. Firebase 콘솔에서 Storage 규칙 확인
2. 파일 크기 제한 확인 (기본 10MB)
3. 브라우저 콘솔에서 오류 메시지 확인

### 관리자 로그인이 안 되는 경우

1. Firebase Authentication에서 계정 존재 확인
2. 이메일/비밀번호 오타 확인
3. Firebase Authentication 설정에서 이메일/비밀번호 활성화 확인

## 📞 추가 도움말

Firebase 공식 문서: https://firebase.google.com/docs
Firestore 보안 규칙: https://firebase.google.com/docs/firestore/security/get-started


