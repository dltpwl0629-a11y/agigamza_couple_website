import { saveQnA, getQnA, saveMarker, getMarkers, saveDiary as dbSaveDiary, getDiaries, supabase } from './db.js';

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

// 전역 상태 캐시 (반복적인 DB 호출 최적화)
let markersCache = [];

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
    const todayStr = new Date().toISOString().split('T')[0];
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
    const todayStr = new Date().toISOString().split('T')[0];
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
    if (screenName === 'calendar') await renderCalendar();
    if (screenName === 'main') await init();
}

let currentViewDate = new Date();
let selectedFullDate = "";

async function changeMonth(offset) {
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    await renderCalendar();
}

async function markDate(type) {
    if (!selectedFullDate) return;
    await saveMarker(selectedFullDate, type);
    await renderCalendar();
    await updateMainDDay();
    alert("날짜 설정이 저장되었습니다! ✨");
}

async function updateMainDDay() {
    markersCache = await getMarkers();
    const vacations = markersCache.filter(m => m.marker_type === 'vacation').map(m => m.date).sort();
    if (vacations.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const future = vacations.find(d => d >= todayStr);
        if (future) VACATION_START_DATE = future;
    }
}

async function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    document.getElementById('calendar-month-year').innerText = `${year}년 ${month + 1}월`;
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    // DB에서 마커들 다시 가져오기
    markersCache = await getMarkers();

    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day other-month';
        daysContainer.appendChild(div);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= lastDate; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.innerText = i;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const marker = markersCache.find(m => m.date === dateStr);
        if (dateStr === todayStr) div.classList.add('today');
        if (marker) div.classList.add(`${marker.marker_type}-day`);
        div.onclick = (e) => selectDate(year, month, i, e);
        daysContainer.appendChild(div);
    }
}

async function selectDate(year, month, day, event) {
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    if (event) event.currentTarget.classList.add('selected');
    selectedFullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    document.getElementById('diary-placeholder').style.display = 'none';
    document.getElementById('diary-section').classList.remove('diary-section-hidden');
    document.getElementById('selected-date-title').innerText = `${year}년 ${month + 1}월 ${day}일`;
    await loadDiaryData();
}

async function loadDiaryData() {
    const entries = await getDiaries(selectedFullDate);
    const kitty = entries.find(e => e.user_id === KITTY_ID);
    const potato = entries.find(e => e.user_id === POTATO_ID);
    document.getElementById('kitty-diary-input').value = kitty ? kitty.content : '';
    document.getElementById('potato-diary-input').value = potato ? potato.content : '';
    // 사진 로직은 별도 테이블 구현 필요하나 현재는 텍스트 우선
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
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(VACATION_START_DATE);
    const isVacation = today >= start && today <= new Date(VACATION_END_DATE);

    if (isVacation) {
        activateVacationMode(start);
    } else {
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
    document.getElementById('app').classList.add('vacation-mode-active');
    document.getElementById('d-day-text').style.display = 'none';
    document.getElementById('vacation-status-msg').innerText = "아기감자와 야옹이가 행복하게 붙어있어요! ❤️";
    setInterval(() => {
        const diff = new Date() - startTime;
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
