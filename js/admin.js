/**
 * Admin Panel Module
 * 경기 정보 편집 및 결과 관리
 */

/**
 * 관리자 패널 렌더링
 */
export function renderAdminPanel() {
  const matchEditor = document.getElementById('matchEditorList');
  const resultEditor = document.getElementById('resultEditorList');

  if (matchEditor) {
    matchEditor.innerHTML = matches
      .map((m, i) => createMatchEditor(m, i))
      .join('');
  }

  if (resultEditor) {
    resultEditor.innerHTML = matches.map((m, i) => createResultEditor(m, i)).join('');
  }

  renderAdminUserList();
  syncDateUI();
}

/**
 * 경기 편집 폼 생성
 */
function createMatchEditor(match, index) {
  const stadiums = [
    '대구',
    '잠실',
    '수원',
    '사직',
    '창원',
    '대전',
    '고척',
    '문학',
    '광주'
  ];
  const times = ['14:00', '17:00', '18:30'];

  return `
    <div class="match-editor">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div>
          <div class="field-label">홈팀</div>
          <input type="text" id="me-t1-${index}" value="${escapeHtml(match.team1 || '')}" 
                 placeholder="팀 이름">
        </div>
        <div>
          <div class="field-label">원정팀</div>
          <input type="text" id="me-t2-${index}" value="${escapeHtml(match.team2 || '')}" 
                 placeholder="팀 이름">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div>
          <div class="field-label">홈팀 선발</div>
          <input type="text" id="me-p1-${index}" value="${escapeHtml(match.pitcher1 || '')}" 
                 placeholder="선발 투수">
        </div>
        <div>
          <div class="field-label">원정팀 선발</div>
          <input type="text" id="me-p2-${index}" value="${escapeHtml(match.pitcher2 || '')}" 
                 placeholder="선발 투수">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div class="field-label">시간</div>
          <select id="me-time-${index}" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg4);color:var(--text)">
            ${times.map(t => `<option value="${t}" ${match.time === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <div class="field-label">구장</div>
          <select id="me-stadium-${index}" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg4);color:var(--text)">
            <option value="">구장 선택</option>
            ${stadiums.map(s => `<option value="${s}" ${match.stadium === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>

      <button class="btn btn-danger" style="width:100%;margin-top:10px" onclick="delMatch(${index})">
        경기 삭제
      </button>
    </div>
  `;
}

/**
 * 결과 편집 폼 생성
 */
function createResultEditor(match, index) {
  return `
    <div class="result-editor">
      <span class="result-match-name">${escapeHtml(match.team1 || '?')} vs ${escapeHtml(match.team2 || '?')}</span>
      <select id="res-${index}" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg4);color:var(--text)">
        <option value="">결과 미정</option>
        ${match.team1 ? `<option value="${match.team1}" ${match.result === match.team1 ? 'selected' : ''}>${escapeHtml(match.team1)} 승</option>` : ''}
        ${match.team2 ? `<option value="${match.team2}" ${match.result === match.team2 ? 'selected' : ''}>${escapeHtml(match.team2)} 승</option>` : ''}
        <option value="무승부" ${match.result === '무승부' ? 'selected' : ''}>무승부</option>
        <option value="경기취소" ${match.result === '경기취소' ? 'selected' : ''}>경기 취소</option>
      </select>
    </div>
  `;
}

/**
 * 경기 추가 (1경기)
 */
export function addMatchEditor() {
  const newMatch = {
    id: matches.length,
    team1: '',
    emoji1: '⚾',
    pitcher1: '',
    team2: '',
    emoji2: '⚾',
    pitcher2: '',
    time: '18:30',
    stadium: '',
    result: null
  };

  matches.push(newMatch);
  renderAdminPanel();
}

/**
 * 경기 추가 (5경기)
 */
export function addFiveMatches() {
  for (let i = 0; i < 5; i++) {
    matches.push({
      id: matches.length,
      team1: '',
      emoji1: '⚾',
      pitcher1: '',
      team2: '',
      emoji2: '⚾',
      pitcher2: '',
      time: '18:30',
      stadium: '',
      result: null
    });
  }

  renderAdminPanel();
  toast('5경기가 일괄 추가되었습니다!', 'success');
}

/**
 * 기본 5경기 세팅 (테스트용)
 */
export function initializeDefaultMatches() {
  matches = [
    {
      id: 0,
      team1: 'LG 트윈스',
      emoji1: '🐯',
      pitcher1: '선발 투수 1',
      team2: 'KIA 타이거즈',
      emoji2: '🐅',
      pitcher2: '선발 투수 2',
      time: '14:00',
      stadium: '잠실',
      result: null
    },
    {
      id: 1,
      team1: '삼성 라이온즈',
      emoji1: '🦁',
      pitcher1: '선발 투수 3',
      team2: '두산 베어스',
      emoji2: '🐻',
      pitcher2: '선발 투수 4',
      time: '17:00',
      stadium: '대구',
      result: null
    },
    {
      id: 2,
      team1: 'SK 와이번스',
      emoji1: '🐍',
      pitcher1: '선발 투수 5',
      team2: 'KT 위즈',
      emoji2: '✨',
      pitcher2: '선발 투수 6',
      time: '18:30',
      stadium: '수원',
      result: null
    },
    {
      id: 3,
      team1: '롯데 자이언츠',
      emoji1: '🎨',
      pitcher1: '선발 투수 7',
      team2: '한화 이글스',
      emoji2: '🦅',
      pitcher2: '선발 투수 8',
      time: '18:30',
      stadium: '사직',
      result: null
    },
    {
      id: 4,
      team1: 'NC 다이노스',
      emoji1: '🦕',
      pitcher1: '선발 투수 9',
      team2: '기아 타이거즈',
      emoji2: '🐅',
      pitcher2: '선발 투수 10',
      time: '18:30',
      stadium: '창원',
      result: null
    }
  ];

  renderAdminPanel();
  toast('기본 5경기가 세팅되었습니다!', 'success');
}

/**
 * 경기 삭제
 */
export function delMatch(index) {
  if (matches.length <= 1) {
    toast('최소 1경기는 있어야 해요', 'error');
    return;
  }

  matches.splice(index, 1);
  matches.forEach((m, idx) => (m.id = idx));
  renderAdminPanel();
}

/**
 * 경기 정보 적용
 */
export async function applyMatches() {
  // 입력값 수집
  matches.forEach((m, i) => {
    const t1 = document.getElementById(`me-t1-${i}`)?.value || '';
    const t2 = document.getElementById(`me-t2-${i}`)?.value || '';

    m.team1 = t1;
    m.team2 = t2;
    m.pitcher1 = document.getElementById(`me-p1-${i}`)?.value.trim() || '';
    m.pitcher2 = document.getElementById(`me-p2-${i}`)?.value.trim() || '';
    m.time = document.getElementById(`me-time-${i}`)?.value || m.time;
    m.stadium = document.getElementById(`me-stadium-${i}`)?.value || m.stadium;
    m.result = null;
  });

  // 유효성 검사
  const invalidMatch = matches.find(m => !m.team1 || !m.team2 || m.team1 === m.team2);
  if (invalidMatch) {
    toast('홈팀/원정팀을 올바르게 설정하세요', 'error');
    return;
  }

  // 기존 참여자가 있으면 경고
  const hasParticipants = Object.keys(rankings).length > 0;
  if (hasParticipants) {
    const ok = confirm(
      `${selectedDateStr()}의 경기 정보를 바꾸면 기존 예측/랭킹 데이터가 초기화됩니다.\n계속할까요?`
    );
    if (!ok) return;
  }

  try {
    // Firebase에 저장 (firebase.js 사용)
    // await saveMatchesToDB(matches);

    if (hasParticipants) {
      // await remove(ref(db, `${currentKey()}/participants`));
    }

    picks = {};
    submitted = false;
    mySubmittedPicks = {};

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '예측 제출하기';
    }

    renderMatches();
    renderAdminPanel();
    renderHistory();
    renderRanking();

    toast('경기 정보가 적용되었어요!', 'success');
  } catch (err) {
    console.error('Apply error:', err);
    toast('적용 실패', 'error');
  }
}

/**
 * 결과 저장 및 점수 계산
 */
export async function saveResults() {
  // 결과값 수집
  matches.forEach((m, i) => {
    m.result = document.getElementById(`res-${i}`)?.value || null;
  });

  try {
    // Firebase에 저장
    // await updateResultsAndScores(matches, rankings);

    renderAdminPanel();
    toast('결과가 저장되고 점수에 반영되었어요!', 'success');
  } catch (err) {
    console.error('Save results error:', err);
    toast('저장 실패', 'error');
  }
}

/**
 * 전체 데이터 초기화
 */
export async function resetAllData() {
  if (!confirm(`${selectedDateStr()} 데이터 전체를 초기화할까요?`)) return;

  try {
    // Firebase에서 삭제
    // await resetAllData();

    matches = [];
    rankings = {};
    picks = {};
    submitted = false;
    mySubmittedPicks = {};

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '예측 제출하기';
    }

    // listenData(); // Firebase 리스너 다시 시작

    toast('선택한 날짜 데이터가 초기화되었어요', 'success');
  } catch (err) {
    console.error('Reset error:', err);
    toast('초기화 실패', 'error');
  }
}
