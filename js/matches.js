/**
 * Match Rendering & Management Module
 * 경기 정보 표시 및 상태 관리
 */

let matches = [];
let picks = {};
let mySubmittedPicks = {};
let submitted = false;
let myName = '';

/**
 * 예측 가능 여부 확인
 */
function isMatchLocked(match) {
  const now = new Date();
  const [h, m] = match.time.split(':').map(Number);
  const matchTime = new Date();
  matchTime.setHours(h, m, 0, 0);
  return now >= matchTime;
}

/**
 * 팀 선택 UI 생성
 */
function createTeamPickElement(match, teamIndex, isLocked) {
  const isTeam1 = teamIndex === 1;
  const team = isTeam1 ? match.team1 : match.team2;
  const emoji = isTeam1 ? match.emoji1 : match.emoji2;
  const pitcher = isTeam1 ? match.pitcher1 : match.pitcher2;
  const pickKey = `${match.id}-${teamIndex}`;
  const isSelected = picks[match.id] === team;

  const classes = ['team-pick'];
  if (isLocked) classes.push('locked');
  if (isSelected) classes.push('selected');

  return `
    <div class="${classes.join(' ')}" 
         ${!isLocked ? `onclick="selectTeam(${match.id}, '${escapeHtml(team)}')"` : ''}
         data-match="${match.id}" 
         data-team="${team}">
      <div class="team-emoji">
        ${emoji.startsWith('http') ? `<img src="${emoji}" alt="${team}" />` : emoji}
      </div>
      <span class="team-nm">${escapeHtml(team)}</span>
      ${pitcher ? `<div class="pitcher-info">${escapeHtml(pitcher)}</div>` : ''}
    </div>
  `;
}

/**
 * vs 구분선
 */
function createVsSeparator() {
  return '<div style="display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:11px;font-weight:700;height:100%">VS</div>';
}

/**
 * 픽 비율 바 생성
 */
function createPickRatioBar(match, pickStats) {
  const total = pickStats.team1 + pickStats.team2;
  if (total === 0) return '';

  const t1Percent = (pickStats.team1 / total) * 100;
  const t2Percent = (pickStats.team2 / total) * 100;

  return `
    <div class="pick-ratio-bar">
      <div class="pick-ratio-t1" style="width:${t1Percent}%"></div>
      <div class="pick-ratio-t2" style="width:${t2Percent}%"></div>
    </div>
    <div class="pick-ratio-label">
      <span>${pickStats.team1}명</span>
      <span>${pickStats.team2}명</span>
    </div>
  `;
}

/**
 * 경기 카드 생성
 */
function createMatchCard(match, index) {
  const isLocked = isMatchLocked(match);
  const hasPick = picks[match.id] !== undefined;
  const pickStats = {
    team1: 0,
    team2: 0
  };

  // 다른 사용자들의 픽 통계 (관리자 패널에서만 표시)
  if (currentPage === 'page-admin') {
    Object.values(rankings).forEach(r => {
      if (r.picks?.[match.id] === match.team1) pickStats.team1++;
      else if (r.picks?.[match.id] === match.team2) pickStats.team2++;
    });
  }

  const classes = ['match-card'];
  if (hasPick) classes.push('has-pick');
  if (isLocked) classes.push('closed-match');

  return `
    <div class="${classes.join(' ')}" data-match-id="${match.id}">
      <div class="match-meta">
        <span class="match-badge">${escapeHtml(match.id + 1)}경기</span>
        <span class="match-stadium">${escapeHtml(match.stadium || '미정')}</span>
        <span class="match-time">${match.time}</span>
      </div>

      <div class="teams-grid">
        ${createTeamPickElement(match, 1, isLocked)}
        ${createVsSeparator()}
        ${createTeamPickElement(match, 2, isLocked)}
      </div>

      ${createPickRatioBar(match, pickStats)}
    </div>
  `;
}

/**
 * 모든 경기 렌더링
 */
export function renderMatches() {
  const container = document.getElementById('matchesContainer');
  if (!container) return;

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding:40px 20px;color:var(--text3)">
        <p style="margin-bottom:10px">경기 정보가 없어요</p>
        <p style="font-size:12px">관리자가 경기를 추가해주세요</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map((m, i) => createMatchCard(m, i)).join('');
  updateStatsBar();
}

/**
 * 통계 바 업데이트
 */
function updateStatsBar() {
  const totalMatches = matches.length;
  const myPicks = Object.keys(picks).length;
  const myCorrect = calculateCorrect();

  const stats = {
    total: totalMatches,
    myPicks: myPicks,
    myCorrect: myCorrect
  };

  const statsBar = document.getElementById('statsBar');
  if (statsBar) {
    statsBar.innerHTML = `
      <div class="stat-item">
        <div class="stat-num">${stats.total}</div>
        <div class="stat-label">전체 경기</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">${stats.myPicks}</div>
        <div class="stat-label">내 예측</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">${stats.myCorrect}</div>
        <div class="stat-label">적중수</div>
      </div>
    `;
  }
}

/**
 * 정답 개수 계산
 */
function calculateCorrect() {
  return matches.filter(m => {
    const isValid =
      m.result &&
      m.result !== '무승부' &&
      m.result !== '경기취소' &&
      picks[m.id];
    return isValid && picks[m.id] === m.result;
  }).length;
}

/**
 * 팀 선택
 */
export function selectTeam(matchId, team) {
  if (submitted) {
    toast('이미 제출한 예측입니다', 'error');
    return;
  }

  const match = matches.find(m => m.id === matchId);
  if (!match) return;

  if (isMatchLocked(match)) {
    toast('경기 시작 시간이 지났습니다', 'error');
    return;
  }

  if (picks[matchId] === team) {
    delete picks[matchId];
  } else {
    picks[matchId] = team;
  }

  renderMatches();
}

/**
 * 예측 제출
 */
export async function submitPicks() {
  const userName = myName || document.getElementById('userName')?.value;
  const password = document.getElementById('userPassword')?.value;

  if (!userName) {
    toast('닉네임을 입력하세요', 'error');
    return;
  }

  if (!password) {
    toast('비밀번호를 입력하세요', 'error');
    return;
  }

  if (Object.keys(picks).length === 0) {
    toast('최소 1경기 이상 예측해주세요', 'error');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) submitBtn.disabled = true;

  try {
    myName = userName;
    mySubmittedPicks = { ...picks };
    submitted = true;

    localStorage.setItem('kbo_name', userName);

    // Firebase에 저장 (firebase.js의 saveUserPicks 호출)
    // await saveUserPicks(userName, picks);

    if (submitBtn) {
      submitBtn.textContent = '예측 제출됨';
    }

    toast('예측이 제출되었습니다!', 'success');
    renderMatches();
  } catch (err) {
    console.error('Submit error:', err);
    toast('제출 실패', 'error');
    if (submitBtn) submitBtn.disabled = false;
  }
}

/**
 * 제출 취소 (비밀번호 확인 후)
 */
export function cancelSubmit() {
  const password = prompt('비밀번호를 입력하세요:');
  if (password !== document.getElementById('userPassword')?.value) {
    toast('비밀번호가 틀렸습니다', 'error');
    return;
  }

  picks = {};
  submitted = false;
  mySubmittedPicks = {};

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = '예측 제출하기';
  }

  toast('예측이 취소되었습니다', 'success');
  renderMatches();
}

/**
 * 매치 데이터 설정
 */
export function setMatches(data) {
  matches = data || [];
}

/**
 * 현재 경기 정보 반환
 */
export function getMatches() {
  return matches;
}

/**
 * 현재 픽 반환
 */
export function getPicks() {
  return picks;
}

/**
 * 제출 상태 반환
 */
export function isSubmitted() {
  return submitted;
}
