import { saveQnA, getQnA, saveMarker, getMarkers, saveDiary as dbSaveDiary, getDiaries } from './db.js';

// 설정
let VACATION_START_DATE = '2026-06-01'; 
const VACATION_END_DATE = '2026-06-07'; 
const KITTY_ID = '00000000-0000-0000-0000-000000000001';
const POTATO_ID = '00000000-0000-0000-0000-000000000002';

const QUESTIONS = [
    "오늘 가장 기억에 남는 순간은 무엇인가요?",
    "지금 당장 같이 먹고 싶은 음식은?",
    "상대방의 가장 귀여운 점 한 가지만 말해준다면?",
    "우리 다음 휴가 때 꼭 하고 싶은 일은?",
    "최근에 나를 보고 설레었던 순간이 있나요?"
];

/**
 * 한국 시간 기준 YYYY-MM-DD 문자열 생성
 */
function getLocalDateStr(date = new Date()) {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date - offset)).toISOString().slice(0, 10);
    return localISOTime;
}

// 전역 상태
let markersCache = [];
let currentViewDate = new Date();
let selectedFullDate = getLocalDateStr(); // 기본 선택 날짜: 오늘

function calculateDDay(targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function updateMeowFace(days) {
    const faceElement = document.getElementById('meow-face');
    if (!faceElement) return;
    let face = '🐱';
    if (days >= 10) face = '😴';
    else if (days >= 4) face = '🙂';
    else if (days >= 1) face = '😍';
    else if (days === 0) face = '🥳';
    else face = '😇';
    faceElement.innerText = face;
}

function renderPotatoes(days) {
    const field = document.getElementById('potato-field');
    if (!field) return;
    field.innerHTML = '';
    if (days <= 0) { field.style.display = 'none'; return; }
    field.style.display = 'grid';
    const bundles = Math.floor(days / 10);
    const individuals = days % 10;
    for (let i = 0; i < bundles; i++) {
        const bundle = document.createElement('div');
        bundle.className = 'potato potato-bundle';
        bundle.innerText = '🧺';
        field.appendChild(bundle);
    }
    for (let i = 0; i < individuals; i++) {
        const potato = document.createElement('div');
        potato.className = 'potato';
        potato.innerText = '🥔';
        field.appendChild(potato);
    }
}

async function initQnA() {
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const qIndex = dateSeed % QUESTIONS.length;
    const questionElement = document.getElementById('current-question');
    if (questionElement) questionElement.innerText = QUESTIONS[qIndex];
    await loadAnswers();
}

async function submitAnswer(user) {
    const input = document.getElementById(`${user}-input`);
    const answer = input.value.trim();
    if (!answer) { alert("내용을 입력해주세요! 🐾"); return; }
    
    const todayStr = getLocalDateStr();
    const userId = user === 'kitty' ? KITTY_ID : POTATO_ID;
    
    await saveQnA(userId, todayStr, answer);
    alert("마음이 전달되었습니다! ❤️");
    input.value = '';
    await loadAnswers();
}

function editAnswer(user) {
    const inputGroup = document.getElementById(`${user}-input-group`);
    const display = document.getElementById(`${user}-answer-display`);
    const editBtn = document.getElementById(`${user}-edit-btn`);
    inputGroup.style.display = 'flex';
    editBtn.style.display = 'none';
    display.innerText = "수정 중...";
    display.classList.add('blurred');
}

async function loadAnswers() {
    const todayStr = getLocalDateStr();
    const answers = await getQnA(todayStr);
    const data = {};
    answers.forEach(a => {
        if (a.user_id === KITTY_ID) data.kitty = a.answer;
        if (a.user_id === POTATO_ID) data.potato = a.answer;
    });

    const kittyDisplay = document.getElementById('kitty-answer-display');
    const potatoDisplay = document.getElementById('potato-answer-display');
    const kittyInputGroup = document.getElementById('kitty-input-group');
    const potatoInputGroup = document.getElementById('potato-input-group');
    const kittyEditBtn = document.getElementById('kitty-edit-btn');
    const potatoEditBtn = document.getElementById('potato-edit-btn');
    const lockNotice = document.getElementById('lock-notice');

    if (!kittyDisplay) return;

    kittyDisplay.classList.add('blurred');
    potatoDisplay.classList.add('blurred');

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

async function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('screen-hidden'));
    const activeScreen = document.getElementById(`${screenName}-screen`);
    if (activeScreen) activeScreen.classList.remove('screen-hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const targetNav = Array.from(document.querySelectorAll('.nav-item')).find(i => {
        const label = i.querySelector('.nav-label').innerText;
        return (screenName === 'main' && label === '홈') || (screenName === 'calendar' && label === '캘린더');
    });
    if (targetNav) targetNav.classList.add('active');
    
    if (screenName === 'calendar') {
        await renderCalendar();
        // 마지막으로 선택했던 날짜 정보가 있다면 다시 불러오기
        if (selectedFullDate) {
            const [y, m, d] = selectedFullDate.split('-').map(Number);
            await selectDate(y, m - 1, d);
        }
    }
    if (screenName === 'main') await init();
}

async function changeMonth(offset) {
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    await renderCalendar();
}

async function markDate(type) {
    if (!selectedFullDate) return;
    await saveMarker(selectedFullDate, type);
    await updateMainDDay(); // 먼저 데이터 동기화
    await renderCalendar(); // 그 다음 달력 갱신
    alert("날짜 설정이 저장되었습니다! ✨");
}

async function updateMainDDay() {
    markersCache = await getMarkers();
    const vacations = markersCache.filter(m => m.marker_type === 'vacation').map(m => m.date).sort();
    if (vacations.length > 0) {
        const todayStr = getLocalDateStr();
        const future = vacations.find(d => d >= todayStr);
        if (future) VACATION_START_DATE = future;
    }
}

async function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const monthYearElement = document.getElementById('calendar-month-year');
    if (monthYearElement) monthYearElement.innerText = `${year}년 ${month + 1}월`;
    
    const daysContainer = document.getElementById('calendar-days');
    if (!daysContainer) return;
    daysContainer.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    markersCache = await getMarkers();

    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day other-month';
        daysContainer.appendChild(div);
    }

    const todayStr = getLocalDateStr();
    for (let i = 1; i <= lastDate; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.innerText = i;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const marker = markersCache.find(m => m.date === dateStr);
        
        if (dateStr === todayStr) div.classList.add('today');
        if (marker) div.classList.add(`${marker.marker_type}-day`);
        if (dateStr === selectedFullDate) div.classList.add('selected');
        
        div.onclick = (e) => selectDate(year, month, i, e);
        daysContainer.appendChild(div);
    }
}

async function selectDate(year, month, day, event) {
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    
    selectedFullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 이벤트 객체가 있는 경우(직접 클릭) 해당 요소 강조
    if (event) {
        event.currentTarget.classList.add('selected');
    } else {
        // 코드에서 호출한 경우 달력을 돌며 해당 날짜 요소를 찾아 강조
        const days = document.querySelectorAll('.calendar-day:not(.other-month)');
        days.forEach(d => {
            if (parseInt(d.innerText) === day) d.classList.add('selected');
        });
    }
    
    document.getElementById('diary-placeholder').style.display = 'none';
    const diarySection = document.getElementById('diary-section');
    if (diarySection) diarySection.classList.remove('diary-section-hidden');
    
    const title = document.getElementById('selected-date-title');
    if (title) title.innerText = `${year}년 ${month + 1}월 ${day}일`;
    
    await loadDiaryData();
}

async function loadDiaryData() {
    const entries = await getDiaries(selectedFullDate);
    const kitty = entries.find(e => e.user_id === KITTY_ID);
    const potato = entries.find(e => e.user_id === POTATO_ID);
    
    const kInput = document.getElementById('kitty-diary-input');
    const pInput = document.getElementById('potato-diary-input');
    
    if (kInput) kInput.value = kitty ? kitty.content : '';
    if (pInput) pInput.value = potato ? potato.content : '';
}

async function saveDiary(user) {
    const text = document.getElementById(`${user}-diary-input`).value.trim();
    if (!text) { alert("내용을 입력해주세요! 🐾"); return; }
    
    const userId = user === 'kitty' ? KITTY_ID : POTATO_ID;
    await dbSaveDiary(userId, selectedFullDate, text);
    alert("기록이 저장되었습니다! ❤️");
}

function uploadPhoto(user, slotNum) {
    alert("사진 업로드 기능은 서버 저장소 설정 후 활성화됩니다! 📸");
}

async function init() {
    await updateMainDDay();
    const todayStr = getLocalDateStr();
    const today = new Date(todayStr);
    const start = new Date(VACATION_START_DATE);
    const end = new Date(VACATION_END_DATE);
    
    const isVacation = today >= start && today <= end;

    if (isVacation) {
        activateVacationMode(start);
    } else {
        const app = document.getElementById('app');
        if (app) app.classList.remove('vacation-mode-active');

        const remainingDays = calculateDDay(VACATION_START_DATE);
        const dDayText = document.getElementById('d-day-text');
        if (dDayText) {
            dDayText.style.display = 'block';
            dDayText.innerText = remainingDays > 0 ? `휴가까지 D-${remainingDays}` : `다음 휴가를 기다려요.. 🌸`;
        }
        updateMeowFace(remainingDays);
        renderPotatoes(remainingDays);
    }
    await initQnA();
}

function activateVacationMode(startTime) {
    const app = document.getElementById('app');
    if (app) app.classList.add('vacation-mode-active');
    
    const dDayText = document.getElementById('d-day-text');
    if (dDayText) dDayText.style.display = 'none';
    
    const statusMsg = document.getElementById('vacation-status-msg');
    if (statusMsg) statusMsg.innerText = "아기감자와 야옹이가 행복하게 붙어있어요! ❤️";
    
    const timerInterval = setInterval(() => {
        const diff = new Date() - startTime;
        if (diff < 0) {
            clearInterval(timerInterval);
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        const timer = document.getElementById('vacation-timer');
        if (timer) timer.innerText = `${d}일 ${h}:${m}:${s}`;
    }, 1000);
}

// 전역 노출
window.switchScreen = switchScreen;
window.changeMonth = changeMonth;
window.markDate = markDate;
window.submitAnswer = submitAnswer;
window.saveDiary = saveDiary;
window.uploadPhoto = uploadPhoto;
window.editAnswer = editAnswer;

document.addEventListener('DOMContentLoaded', init);
