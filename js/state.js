/**
 * Global State Management
 * 모든 모듈에서 접근 가능한 전역 상태
 */

// ────────────────────────────────────────────────────────────────────
// APPLICATION STATE
// ────────────────────────────────────────────────────────────────────

window.APP_STATE = {
  // UI State
  currentPage: 'page-predict',
  selectedDate: null,

  // Data State
  matches: [],
  picks: {},
  mySubmittedPicks: {},
  submitted: false,
  myName: '',
  rankings: {},

  // Firebase
  db: null,

  // Getters & Setters
  setDate(date) {
    this.selectedDate = date;
  },

  getDate() {
    return this.selectedDate;
  },

  setMatches(data) {
    this.matches = data || [];
  },

  getMatches() {
    return this.matches;
  },

  setRankings(data) {
    this.rankings = data || {};
  },

  getRankings() {
    return this.rankings;
  },

  setPicks(picks) {
    this.picks = picks || {};
  },

  getPicks() {
    return this.picks;
  },

  selectTeam(matchId, team) {
    if (this.picks[matchId] === team) {
      delete this.picks[matchId];
    } else {
      this.picks[matchId] = team;
    }
  },

  submitPicks(userName) {
    this.myName = userName;
    this.mySubmittedPicks = { ...this.picks };
    this.submitted = true;
  },

  resetPicks() {
    this.picks = {};
    this.submitted = false;
    this.mySubmittedPicks = {};
  },

  currentKey() {
    if (!this.selectedDate) return null;
    return `matches_${this.selectedDate}`;
  }
};

// ────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS (전역 사용)
// ────────────────────────────────────────────────────────────────────

/**
 * HTML 특수문자 이스케이프
 */
window.escapeHtml = function(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, char => map[char]);
};

/**
 * 토스트 메시지 표시
 */
window.toast = function(message, type = 'info') {
  let existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.remove(), 3000);
};

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
window.formatDate = function(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 요일 이름 반환
 */
window.getDayName = function(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

/**
 * ISO 문자열을 Date 객체로 변환
 */
window.parseIsoDate = function(isoString) {
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * 선택된 날짜를 문자열로 표시
 */
window.selectedDateStr = function() {
  const date = APP_STATE.getDate();
  const d = parseIsoDate(date);
  return `${date} (${getDayName(d)})`;
};

/**
 * 현재 날짜의 데이터베이스 키 생성
 */
window.currentKey = function() {
  return APP_STATE.currentKey();
};

// ────────────────────────────────────────────────────────────────────
// SHORTHAND ACCESSORS (편의상)
// ────────────────────────────────────────────────────────────────────

Object.defineProperty(window, 'matches', {
  get() {
    return APP_STATE.matches;
  },
  set(val) {
    APP_STATE.setMatches(val);
  }
});

Object.defineProperty(window, 'picks', {
  get() {
    return APP_STATE.picks;
  },
  set(val) {
    APP_STATE.setPicks(val);
  }
});

Object.defineProperty(window, 'submitted', {
  get() {
    return APP_STATE.submitted;
  },
  set(val) {
    APP_STATE.submitted = val;
  }
});

Object.defineProperty(window, 'mySubmittedPicks', {
  get() {
    return APP_STATE.mySubmittedPicks;
  },
  set(val) {
    APP_STATE.mySubmittedPicks = val;
  }
});

Object.defineProperty(window, 'myName', {
  get() {
    return APP_STATE.myName;
  },
  set(val) {
    APP_STATE.myName = val;
  }
});

Object.defineProperty(window, 'rankings', {
  get() {
    return APP_STATE.rankings;
  },
  set(val) {
    APP_STATE.setRankings(val);
  }
});

Object.defineProperty(window, 'selectedDate', {
  get() {
    return APP_STATE.getDate();
  },
  set(val) {
    APP_STATE.setDate(val);
  }
});

Object.defineProperty(window, 'currentPage', {
  get() {
    return APP_STATE.currentPage;
  },
  set(val) {
    APP_STATE.currentPage = val;
  }
});

Object.defineProperty(window, 'db', {
  get() {
    return APP_STATE.db;
  },
  set(val) {
    APP_STATE.db = val;
  }
});

// ────────────────────────────────────────────────────────────────────
// INITIALIZE STATE
// ────────────────────────────────────────────────────────────────────

// 초기 날짜 설정
APP_STATE.setDate(formatDate(new Date()));

console.log('✓ Global state initialized');
