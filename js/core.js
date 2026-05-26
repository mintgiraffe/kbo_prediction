/**
 * KBO Prediction - Main JavaScript
 * 분리된 모듈식 코드 구조
 */

// ────────────────────────────────────────────────────────────────────
// UTILITIES & HELPERS
// ────────────────────────────────────────────────────────────────────

/**
 * HTML 특수문자 이스케이프
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, char => map[char]);
}

/**
 * 토스트 메시지 표시
 */
function toast(message, type = 'info') {
  let existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.remove(), 3000);
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * ISO 문자열을 Date 객체로 변환
 */
function parseIsoDate(isoString) {
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 요일 이름 반환
 */
function getDayName(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

/**
 * 선택된 날짜를 문자열로 표시 (예: 2024-05-26 (월))
 */
function selectedDateStr() {
  const d = parseIsoDate(selectedDate);
  return `${selectedDate} (${getDayName(d)})`;
}

/**
 * 현재 날짜의 데이터베이스 키 생성
 */
function currentKey() {
  return `matches_${selectedDate}`;
}

// ────────────────────────────────────────────────────────────────────
// UI STATE MANAGEMENT
// ────────────────────────────────────────────────────────────────────

let currentPage = 'page-predict';
let selectedDate = formatDate(new Date());

/**
 * 페이지 전환
 */
function switchPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  document.getElementById(pageName)?.classList.add('active');
  document.querySelector(`.nav-tab[data-page="${pageName}"]`)?.classList.add('active');

  currentPage = pageName;
}

/**
 * 날짜 선택 UI 동기화
 */
function syncDateUI() {
  const input = document.getElementById('datePicker');
  if (input) input.value = selectedDate;
  renderMatches();
  renderRanking();
  renderHistory();
}

/**
 * 사용자 아바타 업데이트
 */
function updateAvatar() {
  const name = document.getElementById('userName')?.value || '';
  const avatar = document.querySelector('.user-avatar');
  if (avatar && name) {
    avatar.textContent = name.substring(0, 2).toUpperCase();
  }
}

// ────────────────────────────────────────────────────────────────────
// CONNECTION STATUS INDICATOR
// ────────────────────────────────────────────────────────────────────

const connStatus = {
  element: null,

  init() {
    this.element = document.querySelector('.conn-status');
  },

  show(state) {
    if (!this.element) return;
    this.element.classList.remove('online', 'offline', 'connecting');
    this.element.classList.add(state, 'show');
  },

  hide() {
    if (this.element) this.element.classList.remove('show');
  }
};

// ────────────────────────────────────────────────────────────────────
// EVENT DELEGATION & NAVIGATION
// ────────────────────────────────────────────────────────────────────

/**
 * 페이지 탭 클릭 핸들러
 */
function initNavigation() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const page = tab.getAttribute('data-page');
      if (page) switchPage(page);
    });
  });
}

/**
 * 사용자 입력 핸들러
 */
function initUserInputHandlers() {
  const userNameInput = document.getElementById('userName');
  const userPasswordInput = document.getElementById('userPassword');

  if (userNameInput) {
    userNameInput.addEventListener('change', () => {
      localStorage.setItem('kbo_name', userNameInput.value);
      updateAvatar();
    });
  }

  if (userPasswordInput) {
    userPasswordInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn && !submitBtn.disabled) submitBtn.click();
      }
    });
  }
}

/**
 * 날짜 선택 핸들러
 */
function initDatePicker() {
  const datePicker = document.getElementById('datePicker');
  if (datePicker) {
    datePicker.addEventListener('change', e => {
      selectedDate = e.target.value;
      syncDateUI();
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ────────────────────────────────────────────────────────────────────

/**
 * 애플리케이션 초기화
 */
function initApp() {
  connStatus.init();
  initNavigation();
  initUserInputHandlers();
  initDatePicker();

  // 저장된 사용자명 복원
  const savedName = localStorage.getItem('kbo_name');
  if (savedName) {
    const userNameInput = document.getElementById('userName');
    if (userNameInput) {
      userNameInput.value = savedName;
      updateAvatar();
    }
  }

  // 초기 날짜 설정
  syncDateUI();
}

// DOM이 로드되면 앱 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
