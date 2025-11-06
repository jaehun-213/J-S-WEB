/* ============================================
   제이앤에스 웹사이트 공통 JavaScript
   ============================================ */

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initImageSlider();
    initFormValidation();
    initFileUpload();
});

// 모바일 메뉴 토글
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // 메뉴 클릭 시 자동 닫힘
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// 부드러운 스크롤
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// 이미지 슬라이더 (Hero Section용)
function initImageSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.hero-dot');
    let currentSlide = 0;
    let slideInterval;
    
    // 슬라이드 전환 함수
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        if (dots.length > 0) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        currentSlide = index;
    }
    
    // 다음 슬라이드
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    // 자동 슬라이드
    if (slides.length > 1) {
        slideInterval = setInterval(nextSlide, 5000);
        
        // 마우스 오버 시 일시정지
        slider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        slider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // 닷 버튼 클릭
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
    });
}

// 폼 검증
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('[required]');
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    // 이메일 형식 검증
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        if (input.value && !validateEmail(input.value)) {
            alert('올바른 이메일 주소를 입력해주세요.');
            input.focus();
            isValid = false;
        }
    });
    
    // 전화번호 형식 검증
    const telInputs = form.querySelectorAll('input[type="tel"]');
    telInputs.forEach(input => {
        if (input.value && !validatePhone(input.value)) {
            alert('올바른 전화번호를 입력해주세요. (010-XXXX-XXXX)');
            input.focus();
            isValid = false;
        }
    });
    
    return isValid;
}

function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
        const label = input.previousElementSibling;
        const labelText = label ? label.textContent : '항목';
        alert(`${labelText}을(를) 입력해주세요.`);
        input.focus();
        return false;
    }
    return true;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^01[0-9]-[0-9]{4}-[0-9]{4}$/;
    return phoneRegex.test(phone);
}

// 전화번호 자동 포맷팅
const telInputs = document.querySelectorAll('input[type="tel"]');
telInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('010')) {
            if (value.length <= 3) {
                e.target.value = value;
            } else if (value.length <= 7) {
                e.target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else {
                e.target.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
            }
        }
    });
});

// 파일 업로드
function initFileUpload() {
    const fileInputs = document.querySelectorAll('.file-input');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const maxFiles = 3;
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            
            if (files.length > maxFiles) {
                alert(`최대 ${maxFiles}개의 파일만 업로드 가능합니다.`);
                e.target.value = '';
                return;
            }
            
            files.forEach(file => {
                if (file.size > maxSize) {
                    alert(`파일 크기는 10MB 이하여야 합니다. (${file.name})`);
                    e.target.value = '';
                    return;
                }
                
                if (!allowedTypes.includes(file.type)) {
                    alert(`지원하지 않는 파일 형식입니다. (jpg, png, pdf만 가능)`);
                    e.target.value = '';
                    return;
                }
            });
            
            // 파일 목록 표시
            const fileList = input.closest('.file-upload').querySelector('.file-list');
            if (fileList && files.length > 0) {
                fileList.innerHTML = files.map(file => 
                    `<div>✓ ${file.name} (${(file.size / 1024).toFixed(2)} KB)</div>`
                ).join('');
            }
        });
    });
}

// 시공 견적 폼 제출 함수는 firebase-quote.js로 이동되었습니다.
// Firebase 연동을 위해 firebase-quote.js의 submitEstimateForm 함수를 사용합니다.


