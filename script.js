// 설정: 휴가 날짜 (YYYY-MM-DD 형식)
const VACATION_DATE = '2026-06-01'; 

// 질문 데이터셋
const QUESTIONS = [
    "오늘 가장 기억에 남는 순간은 무엇인가요?",
    "지금 당장 같이 먹고 싶은 음식은?",
    "상대방의 가장 귀여운 점 한 가지만 말해준다면?",
    "우리 다음 휴가 때 꼭 하고 싶은 일은?",
    "최근에 나를 보고 설레었던 순간이 있나요?"
];

function calculateDDay(targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function updateMeowFace(days) {
    const faceElement = document.getElementById('meow-face');
    let face = '🐱'; // 기본형

    if (days >= 10) {
        face = '😴'; // 멀었을 때
    } else if (days >= 4) {
        face = '🙂'; // 다가올 때
    } else if (days >= 1) {
        face = '😍'; // 직전
    } else if (days === 0) {
        face = '🥳'; // 당일
    } else {
        face = '😇'; // 휴가 중/종료
    }

    faceElement.innerText = face;
}

function renderPotatoes(days) {
    const field = document.getElementById('potato-field');
    field.innerHTML = ''; // 초기화

    if (days <= 0) {
        field.style.display = 'none'; // 휴가 당일이나 이후엔 밭을 숨김
        return;
    }

    // 남은 일수만큼 감자 생성
    for (let i = 0; i < days; i++) {
        const potato = document.createElement('div');
        potato.className = 'potato';
        potato.innerText = '🥔';
        field.appendChild(potato);
    }
}

// Q&A 로직
function initQnA() {
    const todayStr = new Date().toISOString().split('T')[0];
    const questionElement = document.getElementById('current-question');
    
    // 날짜별로 질문 결정 (간단한 해시)
    const qIndex = todayStr.length % QUESTIONS.length;
    questionElement.innerText = QUESTIONS[qIndex];

    loadAnswers();
}

function submitAnswer(user) {
    const input = document.getElementById(`${user}-input`);
    const answer = input.value.trim();

    if (!answer) {
        alert("내용을 입력해주세요! 🐾");
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const storageKey = `qna_${todayStr}`;
    let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    data[user] = answer;
    localStorage.setItem(storageKey, JSON.stringify(data));

    input.value = '';
    loadAnswers();
}

function loadAnswers() {
    const todayStr = new Date().toISOString().split('T')[0];
    const storageKey = `qna_${todayStr}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const kittyDisplay = document.getElementById('kitty-answer-display');
    const potatoDisplay = document.getElementById('potato-answer-display');
    const kittyInputGroup = document.getElementById('kitty-input-group');
    const potatoInputGroup = document.getElementById('potato-input-group');
    const lockNotice = document.getElementById('lock-notice');

    // 답변 존재 여부 확인
    if (data.kitty) {
        kittyDisplay.innerText = "답변 완료! 상대방의 답변을 기다리는 중..";
        kittyInputGroup.style.display = 'none';
    }
    if (data.potato) {
        potatoDisplay.innerText = "답변 완료! 상대방의 답변을 기다리는 중..";
        potatoInputGroup.style.display = 'none';
    }

    // 둘 다 답변했을 경우 잠금 해제
    if (data.kitty && data.potato) {
        kittyDisplay.innerText = data.kitty;
        potatoDisplay.innerText = data.potato;
        
        kittyDisplay.classList.remove('blurred');
        potatoDisplay.classList.remove('blurred');
        
        lockNotice.innerText = "서로의 마음을 확인했어요! ❤️";
    }
}
// 설정: 휴가 날짜 (YYYY-MM-DD 형식)
const VACATION_START_DATE = '2026-06-01'; 
const VACATION_END_DATE = '2026-06-07'; // 일주일 휴가 가정

// 질문 데이터셋
...
function init() {
    const today = new Date();
    const start = new Date(VACATION_START_DATE);
    const end = new Date(VACATION_END_DATE);

    // 휴가 기간 체크 (당일 포함)
    const isVacation = today >= start && today <= end;

    if (isVacation) {
        activateVacationMode(start);
    } else {
        const remainingDays = calculateDDay(VACATION_START_DATE);
        const dDayText = document.getElementById('d-day-text');

        if (remainingDays > 0) {
            dDayText.innerText = `휴가까지 D-${remainingDays}`;
        } else {
            // 휴가 종료 후
            dDayText.innerText = `다음 휴가를 기다려요.. 🌸`;
        }

        updateMeowFace(remainingDays);
        renderPotatoes(remainingDays);
    }

    initQnA();
}

function activateVacationMode(startTime) {
    const app = document.getElementById('app');
    const dDayText = document.getElementById('d-day-text');
    const statusMsg = document.getElementById('vacation-status-msg');
    const meowFace = document.getElementById('meow-face');

    app.classList.add('vacation-mode-active');
    dDayText.style.display = 'none';
    statusMsg.innerText = "아기감자와 야옹이가 행복하게 붙어있어요! ❤️";
    meowFace.innerText = '🥳';

    // 실시간 타이머 작동
    updateVacationTimer(startTime);
    setInterval(() => updateVacationTimer(startTime), 1000);
}

function updateVacationTimer(startTime) {
    const now = new Date();
    const diff = now - startTime;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const timerDisplay = document.getElementById('vacation-timer');
    timerDisplay.innerText = `${days}일 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 초기화 실행

function switchScreen(screenName) {
    // 네비게이션 버튼 활성화 상태 변경
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // 클릭된 버튼 활성화 (이벤트 타겟 찾기 로직 보완 가능)
    // 여기서는 간단히 처리
    event.currentTarget.classList.add('active');

    if (screenName === 'main') {
        // 홈 화면은 현재 화면이므로 유지
        console.log("홈 화면입니다.");
    } else {
        // 나머지 화면은 추후 구현 예정이므로 알림 표시
        alert(`'${screenName}' 기능은 현재 준비 중입니다! 🐾`);
    }
}

// 초기화 실행
document.addEventListener('DOMContentLoaded', init);
