// Firebase 견적 요청 처리 함수
// 전역 스코프에서 접근 가능하도록 window 객체에 할당

async function submitEstimateForm(form) {
    console.log('=== 견적 요청 폼 제출 시작 ===');
    console.log('폼 요소:', form);
    console.log('함수 호출 확인됨');
    
    try {
        // 폼 데이터 수집
        console.log('폼 데이터 수집 시작...');
        const formData = new FormData(form);
        const data = {
            name: formData.get('company_name'),
            contact: formData.get('phone'),
            email: formData.get('email'),
            quoteTitle: formData.get('quote_title'), // 사용자가 입력한 제목
            businessArea: formData.get('business_area') || '기타',
            location: formData.get('location') || '',
            details: formData.get('message'),
            attachments: formData.getAll('attachments[]')
        };
        
        console.log('수집된 폼 데이터:', {
            name: data.name,
            contact: data.contact,
            email: data.email,
            quoteTitle: data.quoteTitle,
            businessArea: data.businessArea,
            hasDetails: !!data.details
        });

        // 필수 필드 검증 (각 항목별 구체적인 메시지)
        console.log('필수 필드 검증 시작...');
        const isEmpty = (value) => {
            return !value || (typeof value === 'string' && value.trim() === '');
        };

        if (isEmpty(data.name)) {
            console.warn('검증 실패: 회사명/성함이 비어있습니다.');
            alert('회사명/성함을 입력해주세요.');
            return false;
        }
        if (isEmpty(data.contact)) {
            alert('연락처를 입력해주세요.');
            return false;
        }
        if (isEmpty(data.email)) {
            alert('이메일을 입력해주세요.');
            return false;
        }
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) {
            alert('올바른 이메일 형식을 입력해주세요.\n예: email@example.com');
            return false;
        }
        if (isEmpty(data.quoteTitle)) {
            alert('견적 제목을 입력해주세요.');
            return false;
        }
        // 제목 길이 검증 (최대 100자)
        if (data.quoteTitle.trim().length > 100) {
            alert('견적 제목은 최대 100자까지 입력 가능합니다.');
            return false;
        }
        if (isEmpty(data.details)) {
            alert('문의 내용(상세)을 입력해주세요.');
            return false;
        }
        // 개인정보 동의 확인
        const privacyAgreement = formData.get('privacy_agreement');
        if (!privacyAgreement) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return false;
        }

        // 로딩 표시
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '처리 중...';

        // Firebase 초기화 확인
        console.log('Firebase 초기화 확인 중...');
        console.log('firebase:', typeof firebase !== 'undefined' ? '✅' : '❌');
        console.log('db:', typeof db !== 'undefined' ? '✅' : '❌');
        console.log('storage:', typeof storage !== 'undefined' ? '✅' : '❌');
        
        if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof storage === 'undefined') {
            console.error('❌ Firebase 초기화 실패:', {
                firebase: typeof firebase,
                db: typeof db,
                storage: typeof storage
            });
            alert('Firebase가 초기화되지 않았습니다.\n페이지를 새로고침하거나 브라우저 콘솔을 확인하세요.');
            submitBtn.disabled = false;
            submitBtn.textContent = '견적 요청하기';
            return false;
        }
        
        console.log('✅ Firebase 초기화 확인 완료');

        // ★ 핵심 수정: 동일한 문서 ID를 보장하기 위한 로직
        
        // 1. Private 컬렉션에서 '먼저' 새 문서 참조(ID)를 생성한다.
        const newDocRef = db.collection('quoteRequests_private').doc();
        const docId = newDocRef.id; // 동일한 ID를 두 컬렉션에 사용
        
        console.log('생성된 문서 ID:', docId);

        // 2. 제목 처리: 사용자가 입력한 제목 사용 (앞뒤 공백 제거)
        // 사용자가 입력한 제목을 그대로 사용하여 견적 현황에서 확인 가능하도록 함
        const title = data.quoteTitle.trim();

        // 3. 파일 업로드 (있는 경우) - 문서 ID를 사용하여 Storage 경로 생성
        const fileUrls = [];
        const files = form.querySelector('input[type="file"]').files;
        
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const storageRef = storage.ref(`quotes/${docId}/${file.name}`);
                await storageRef.put(file);
                const downloadURL = await storageRef.getDownloadURL();
                fileUrls.push(downloadURL);
            }
        }

        // 4. Private 데이터 객체 준비
        const privateData = {
            name: data.name,
            contact: data.contact,
            email: data.email,
            businessArea: data.businessArea,
            location: data.location,
            details: data.details,
            fileUrls: fileUrls,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 5. Public 데이터 객체 준비
        const publicData = {
            title: title,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 6. ★ 핵심: Batch를 사용하여 두 작업을 원자적으로(동시에) 실행
        // 이렇게 하면 두 컬렉션에 동일한 ID로 데이터가 저장되거나, 둘 다 실패하거나 둘 중 하나만 발생하지 않습니다.
        const batch = db.batch();
        
        // (A) 동일한 ID로 Private 문서 'set'
        batch.set(newDocRef, privateData);
        
        // (B) 동일한 ID로 Public 문서 'set'
        const publicDocRef = db.collection('quoteRequests_public').doc(docId);
        batch.set(publicDocRef, publicData);

        // 7. Batch 실행 (원자적 작업)
        console.log('Batch 커밋 시작...');
        await batch.commit();
        console.log('✅ Batch 커밋 완료');
        
        // 저장 확인: Public 문서가 실제로 저장되었는지 확인
        const verifyDoc = await db.collection('quoteRequests_public').doc(docId).get();
        if (verifyDoc.exists) {
            console.log('✅ Public 문서 저장 확인 완료:', {
                id: verifyDoc.id,
                title: verifyDoc.data().title,
                createdAt: verifyDoc.data().createdAt
            });
        } else {
            console.error('❌ Public 문서 저장 확인 실패: 문서가 존재하지 않습니다.');
        }
        
        console.log('✅ Public/Private 데이터가 동일한 ID로 성공적으로 저장되었습니다:', docId);

        // 성공 메시지
        alert('견적 요청이 정상적으로 접수되었습니다.\n견적 현황 페이지로 이동합니다.');
        
        // 견적 현황 페이지로 리디렉션 (새로고침하여 최신 목록 확인)
        window.location.href = 'quote-list.html';
        
        // 리디렉션 전에 폼 리셋 (선택사항)
        form.reset();
        const fileList = form.querySelector('.file-list');
        if (fileList) {
            fileList.innerHTML = '';
        }

        return false;

    } catch (error) {
        console.error('견적 요청 오류:', error);
        console.error('오류 코드:', error.code);
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
        
        // Firebase 초기화 확인
        let errorMsg = '견적 요청 중 오류가 발생했습니다.\n\n';
        
        if (typeof firebase === 'undefined') {
            errorMsg += '오류: Firebase가 초기화되지 않았습니다.\nfirebase-config.js 파일을 확인하세요.';
        } else if (typeof db === 'undefined') {
            errorMsg += '오류: Firestore가 초기화되지 않았습니다.\nfirebase-config.js 파일을 확인하세요.';
        } else if (typeof storage === 'undefined') {
            errorMsg += '오류: Firebase Storage가 초기화되지 않았습니다.\nfirebase-config.js 파일을 확인하세요.';
        } else if (error.code === 'permission-denied') {
            errorMsg += '오류: 권한이 거부되었습니다.\nFirestore 보안 규칙을 확인하세요.\n\n';
            errorMsg += 'Firebase 콘솔에서 Firestore 규칙을 확인하고,\nquoteRequests_public과 quoteRequests_private 컬렉션에 대한 쓰기 권한이 있는지 확인하세요.';
        } else if (error.code === 'unavailable') {
            errorMsg += '오류: Firebase 서비스를 사용할 수 없습니다.\n인터넷 연결을 확인하세요.';
        } else {
            errorMsg += `오류 코드: ${error.code || '알 수 없음'}\n`;
            errorMsg += `오류 메시지: ${error.message || '알 수 없는 오류'}`;
        }
        
        alert(errorMsg);
        
        // 버튼 상태 복원
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '견적 요청하기';
        }
        
        return false;
    }
}

// 전역에서 접근 가능하도록 window 객체에 할당 (안전장치)
if (typeof window !== 'undefined') {
    window.submitEstimateForm = submitEstimateForm;
    console.log('✅ submitEstimateForm 함수가 전역 스코프에 등록되었습니다.');
}

