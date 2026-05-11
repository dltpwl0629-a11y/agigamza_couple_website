// 설정: 기본 휴가 날짜 (마커가 없을 경우 대비)
let VACATION_START_DATE = '2026-06-01'; 
const VACATION_END_DATE = '2026-06-07'; 

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
    if (!faceElement) return;

    let face = '🐱'; // 기본형
    if (days >= 10) {
        face = '😴';
    } else if (days >= 4) {
        face = '🙂';
    } else if (days >= 1) {
        face = '😍';
    } else if (days === 0) {
        face = '🥳';
    } else {
        face = '😇';
    }
    faceElement.innerText = face;
}

function renderPotatoes(days) {
    const field = document.getElementById('potato-field');
    if (!field) return;

    field.innerHTML = '';
    if (days <= 0) {
        field.style.display = 'none';
        return;
    }
    field.style.display = 'grid';

    // 10일 단위 묶음 계산
    const bundles = Math.floor(days / 10);
    const individuals = days % 10;

    // 묶음 감자 생성 (10개들이)
    for (let i = 0; i < bundles; i++) {
        const bundle = document.createElement('div');
        bundle.className = 'potato potato-bundle';
        bundle.innerText = '🧺'; // 바구니나 더 큰 감자 더미 아이콘
        bundle.title = "10일 묶음 감자";
        field.appendChild(bundle);
    }

    // 일반 감자 생성
    for (let i = 0; i < individuals; i++) {
        const potato = document.createElement('div');
        potato.className = 'potato';
        potato.innerText = '🥔';
        field.appendChild(potato);
    }
}

// Q&A 로직
function initQnA() {
    // 현재 날짜를 기반으로 고정된 인덱스 생성
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const qIndex = dateSeed % QUESTIONS.length;
    
    const questionElement = document.getElementById('current-question');
    if (questionElement) {
        questionElement.innerText = QUESTIONS[qIndex];
    }
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

    loadAnswers();
}

function editAnswer(user) {
    const todayStr = new Date().toISOString().split('T')[0];
    const storageKey = `qna_${todayStr}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const inputGroup = document.getElementById(`${user}-input-group`);
    const input = document.getElementById(`${user}-input`);
    const editBtn = document.getElementById(`${user}-edit-btn`);
    const display = document.getElementById(`${user}-answer-display`);

    inputGroup.style.display = 'flex';
    input.value = data[user] || '';
    editBtn.style.display = 'none';
    display.innerText = "수정 중...";
    display.classList.add('blurred');
}

function loadAnswers() {
    const todayStr = new Date().toISOString().split('T')[0];
    const storageKey = `qna_${todayStr}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const kittyDisplay = document.getElementById('kitty-answer-display');
    const potatoDisplay = document.getElementById('potato-answer-display');
    const kittyInputGroup = document.getElementById('kitty-input-group');
    const potatoInputGroup = document.getElementById('potato-input-group');
    const kittyEditBtn = document.getElementById('kitty-edit-btn');
    const potatoEditBtn = document.getElementById('potato-edit-btn');
    const lockNotice = document.getElementById('lock-notice');

    if (!kittyDisplay || !potatoDisplay) return;

    kittyDisplay.classList.add('blurred');
    potatoDisplay.classList.add('blurred');
    kittyEditBtn.style.display = 'none';
    potatoEditBtn.style.display = 'none';

    if (data.kitty) {
        kittyDisplay.innerText = "답변 완료! 상대방의 답변을 기다리는 중..";
        kittyInputGroup.style.display = 'none';
        kittyEditBtn.style.display = 'inline-block';
    } else {
        kittyDisplay.innerText = "답변을 입력하면 공개됩니다!";
        kittyInputGroup.style.display = 'flex';
    }

    if (data.potato) {
        potatoDisplay.innerText = "답변 완료! 상대방의 답변을 기다리는 중..";
        potatoInputGroup.style.display = 'none';
        potatoEditBtn.style.display = 'inline-block';
    } else {
        potatoDisplay.innerText = "답변을 입력하면 공개됩니다!";
        potatoInputGroup.style.display = 'flex';
    }

    if (data.kitty && data.potato) {
        kittyDisplay.innerText = data.kitty;
        potatoDisplay.innerText = data.potato;
        kittyDisplay.classList.remove('blurred');
        potatoDisplay.classList.remove('blurred');
        lockNotice.innerText = "서로의 마음을 확인했어요! ❤️";
    } else {
        lockNotice.innerText = "두 명 모두 답변해야 서로의 내용을 볼 수 있어요! 🔒";
    }
}

// 화면 전환 로직
function switchScreen(screenName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('screen-hidden'));

    const activeScreen = document.getElementById(`${screenName}-screen`);
    if (activeScreen) {
        activeScreen.classList.remove('screen-hidden');
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const targetNav = Array.from(navItems).find(item => {
        const label = item.querySelector('.nav-label').innerText;
        if (screenName === 'main' && label === '홈') return true;
        if (screenName === 'calendar' && label === '캘린더') return true;
        if (screenName === 'footsteps' && label === '발자취') return true;
        if (screenName === 'bucketlist' && label === '버킷리스트') return true;
        return false;
    });

    if (targetNav) targetNav.classList.add('active');

    if (screenName === 'calendar') {
        renderCalendar();
    }
    if (screenName === 'main') {
        init(); // 메인 화면 돌아올 때 D-Day 등 갱신
    }
}

// 캘린더 관련 상태
let currentViewDate = new Date();
let selectedFullDate = ""; 
let currentUploadUser = "";
let currentUploadSlot = 0;

function changeMonth(offset) {
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    renderCalendar();
}

// 날짜 마킹 기능
function markDate(type) {
    if (!selectedFullDate) return;

    const storageKey = `marker_${selectedFullDate}`;
    if (type === 'none') {
        localStorage.removeItem(storageKey);
    } else {
        localStorage.setItem(storageKey, type);
    }

    renderCalendar(); // 캘린더 갱신
    updateMainDDay(); // 데이터 동기화
    alert(`이 날을 ${type === 'none' ? '일반 날짜' : type}로 설정했습니다! ✨`);
}

function updateMainDDay() {
    const allMarkers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('marker_') && localStorage.getItem(key) === 'vacation') {
            allMarkers.push(key.replace('marker_', ''));
        }
    }

    if (allMarkers.length > 0) {
        allMarkers.sort(); 
        const todayStr = new Date().toISOString().split('T')[0];
        const futureVacations = allMarkers.filter(date => date >= todayStr);
        
        if (futureVacations.length > 0) {
            VACATION_START_DATE = futureVacations[0]; 
        }
    }
}

function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const monthYearElement = document.getElementById('calendar-month-year');
    if (!monthYearElement) return;

    monthYearElement.innerText = `${year}년 ${month + 1}월`;

    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.innerText = prevLastDay - i;
        daysContainer.appendChild(dayDiv);
    }

    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = i;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const markerType = localStorage.getItem(`marker_${dateStr}`);

        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            dayDiv.classList.add('today');
        }

        if (markerType) {
            dayDiv.classList.add(`${markerType}-day`);
        }

        dayDiv.onclick = (e) => selectDate(year, month, i, e);
        daysContainer.appendChild(dayDiv);
    }

    const totalFilled = startDayOfWeek + lastDay.getDate();
    const remaining = 42 - totalFilled;
    for (let i = 1; i <= remaining; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.innerText = i;
        daysContainer.appendChild(dayDiv);
    }
}

function selectDate(year, month, day, event) {
    const allDays = document.querySelectorAll('.calendar-day');
    allDays.forEach(d => d.classList.remove('selected'));
    
    if (event) event.currentTarget.classList.add('selected');

    selectedFullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    document.getElementById('diary-placeholder').style.display = 'none';
    const diarySection = document.getElementById('diary-section');
    diarySection.classList.remove('diary-section-hidden');
    document.getElementById('selected-date-title').innerText = `${year}년 ${month + 1}월 ${day}일`;

    loadDiaryData();
}

function loadDiaryData() {
    const storageKey = `diary_${selectedFullDate}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');

    document.getElementById('kitty-diary-input').value = data.kittyText || '';
    document.getElementById('potato-diary-input').value = data.potatoText || '';

    updatePhotoSlot('kitty', 1, data.kittyPhoto1);
    updatePhotoSlot('kitty', 2, data.kittyPhoto2);
    updatePhotoSlot('potato', 1, data.potatoPhoto1);
    updatePhotoSlot('potato', 2, data.potatoPhoto2);
}

function saveDiary(user) {
    const text = document.getElementById(`${user}-diary-input`).value.trim();
    if (!text) {
        alert("기록할 내용을 입력해주세요! 🐾");
        return;
    }

    const storageKey = `diary_${selectedFullDate}`;
    let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    data[`${user}Text`] = text;
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    alert(`${user === 'kitty' ? '야옹이' : '아기감자'}의 기록이 저장되었습니다! ❤️`);
}

function uploadPhoto(user, slotNum) {
    currentUploadUser = user;
    currentUploadSlot = slotNum;
    document.getElementById('real-photo-input').click();
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('real-photo-input');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400; 
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    
                    const storageKey = `diary_${selectedFullDate}`;
                    let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
                    data[`${currentUploadUser}Photo${currentUploadSlot}`] = compressedDataUrl;
                    
                    try {
                        localStorage.setItem(storageKey, JSON.stringify(data));
                        updatePhotoSlot(currentUploadUser, currentUploadSlot, compressedDataUrl);
                    } catch (e) {
                        alert("저장 공간이 부족합니다! 😢");
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    init(); 
});

function updatePhotoSlot(user, slotNum, url) {
    const slot = document.getElementById(`photo-${user}-${slotNum}`);
    if (url) {
        slot.style.backgroundImage = `url('${url}')`;
        slot.innerHTML = ''; 
    } else {
        slot.style.backgroundImage = '';
        slot.innerHTML = `<span>${user === 'kitty' ? '🐾' : '🥔'} Photo ${slotNum}</span>`;
    }
}

function activateVacationMode(startTime) {
    const app = document.getElementById('app');
    const dDayText = document.getElementById('d-day-text');
    const statusMsg = document.getElementById('vacation-status-msg');
    const meowFace = document.getElementById('meow-face');

    if (app) app.classList.add('vacation-mode-active');
    if (dDayText) dDayText.style.display = 'none';
    if (statusMsg) statusMsg.innerText = "아기감자와 야옹이가 행복하게 붙어있어요! ❤️";
    if (meowFace) meowFace.innerText = '🥳';

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
    if (timerDisplay) {
        timerDisplay.innerText = `${days}일 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function init() {
    updateMainDDay(); // 마킹된 데이터 기반으로 휴가일 동기화
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(VACATION_START_DATE);
    start.setHours(0,0,0,0);
    const end = new Date(VACATION_END_DATE);
    end.setHours(0,0,0,0);
    
    const isVacation = today >= start && today <= end;

    if (isVacation) {
        activateVacationMode(start);
    } else {
        const app = document.getElementById('app');
        if (app) app.classList.remove('vacation-mode-active'); // 휴가 모드 해제

        const remainingDays = calculateDDay(VACATION_START_DATE);
        const dDayText = document.getElementById('d-day-text');
        const statusMsg = document.getElementById('vacation-status-msg');

        if (dDayText) {
            dDayText.style.display = 'block';
            if (remainingDays > 0) {
                dDayText.innerText = `휴가까지 D-${remainingDays}`;
            } else {
                dDayText.innerText = `다음 휴가를 기다려요.. 🌸`;
            }
        }
        if (statusMsg) statusMsg.innerText = "";
        
        updateMeowFace(remainingDays);
        renderPotatoes(remainingDays);
    }
    initQnA();
}
