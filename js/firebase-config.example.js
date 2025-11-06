// ============================================
// Firebase 설정 예제 파일
// ============================================
// 
// ⚠️ 중요: 이 파일은 예제 파일입니다.
// 
// 사용 방법:
// 1. 이 파일의 이름을 'firebase-config.js'로 복사하세요.
// 2. Firebase 콘솔(https://console.firebase.google.com/)에서
//    프로젝트 설정 > 일반 > 앱 > 웹 앱의 Firebase SDK 설정에서
//    실제 값을 찾아 아래 "YOUR_..." 부분에 채워넣으세요.
// 
// ⚠️ 보안 주의사항:
// - 'firebase-config.js' 파일은 절대로 GitHub에 올리면 안 됩니다.
// - .gitignore 파일에 'js/firebase-config.js'가 포함되어 있는지 확인하세요.
// - 실제 프로덕션 환경에서는 환경 변수나 서버 사이드 설정을 사용하는 것을 권장합니다.

// Firebase 설정 객체
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE",
    measurementId: "YOUR_MEASUREMENT_ID_HERE" // (선택사항)
};

// Firebase 초기화 (Firebase SDK가 로드된 후에만 실행)
if (typeof firebase !== 'undefined') {
    // Firebase App 초기화
    firebase.initializeApp(firebaseConfig);
    
    // Firestore 인스턴스
    var db = firebase.firestore();
    window.db = db;
    console.log('✅ Firestore 초기화 완료');
    
    // Storage 인스턴스 (SDK가 로드된 경우에만 초기화)
    // 일부 페이지에서는 Storage가 필요하지 않으므로 경고 없이 조용히 처리
    if (typeof firebase.storage === 'function') {
        var storage = firebase.storage();
        window.storage = storage;
        console.log('✅ Storage 초기화 완료');
    }
    
    // Authentication 인스턴스 (SDK가 로드된 경우에만 초기화)
    // 일부 페이지에서는 Auth가 필요하지 않으므로 경고 없이 조용히 처리
    if (typeof firebase.auth === 'function') {
        var auth = firebase.auth();
        window.auth = auth;
        console.log('✅ Authentication 초기화 완료');
    }
} else {
    console.warn('⚠️ Firebase SDK가 로드되지 않았습니다. Firebase SDK를 먼저 로드해주세요.');
}

