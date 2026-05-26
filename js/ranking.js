/**
 * Ranking & History Module
 * 랭킹 표시 및 히스토리 관리
 */

let rankings = {};

/**
 * 사용자 레코드 삭제
 */
export async function deleteUserRecord(userName) {
  if (!confirm(`${selectedDateStr()}의 '${userName}'님 예측 기록을 개별 삭제할까요?`))
    return;

  if (!db) {
    toast('Firebase 연결 필요', 'error');
    return;
  }

  try {
    await deleteUserRecord(userName);

    // 관리자 본인의 기록을 지웠다면 초기화
    if (userName === myName) {
      picks = {};
      submitted = false;
      mySubmittedPicks = {};
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '예측 제출하기';
      }
      renderMatches();
    }

    toast(`${userName}님의 기록이 삭제되었어요!`, 'success');
    renderRanking();
  } catch (err) {
    console.error('Delete error:', err);
    toast('삭제 실패', 'error');
  }
}

/**
 * 랭킹 아이템 생성
 */
function createRankingItem(rank, user) {
  const percentage = user.total ? Math.round((user.correct / user.total) * 100) : 0;

  return `
    <div class="ranking-item">
      <span class="ranking-badge">#${rank}</span>
      <span class="ranking-name">${escapeHtml(user.name)}</span>
      <div class="ranking-stats">
        <div class="ranking-stat">
          <div style="font-size:11px;color:var(--text3)">맞힘</div>
          <div class="ranking-correct">${user.correct}</div>
        </div>
        <div class="ranking-stat">
          <div style="font-size:11px;color:var(--text3)">총</div>
          <div>${user.total}</div>
        </div>
        <div class="ranking-stat">
          <div style="font-size:11px;color:var(--text3)">적중률</div>
          <div class="ranking-percentage">${percentage}%</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 랭킹 렌더링
 */
export function renderRanking() {
  const container = document.getElementById('rankingContainer');
  if (!container) return;

  const rankList = Object.values(rankings).sort((a, b) => {
    const aRate = a.total ? a.correct / a.total : 0;
    const bRate = b.total ? b.correct / b.total : 0;
    if (aRate !== bRate) return bRate - aRate;
    return b.correct - a.correct;
  });

  if (rankList.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding:40px 20px;color:var(--text3)">
        <p>아직 참여자가 없어요</p>
      </div>
    `;
    return;
  }

  container.innerHTML = rankList.map((user, i) => createRankingItem(i + 1, user)).join('');
}

/**
 * 관리자 사용자 목록 렌더링
 */
export function renderAdminUserList() {
  const ul = document.getElementById('adminUserList');
  if (!ul) return;

  const list = Object.values(rankings);
  if (list.length === 0) {
    ul.innerHTML =
      '<p style="font-size:14px;color:var(--text3)">아직 참여자가 없어요</p>';
    return;
  }

  const tableHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="border-bottom:1px solid var(--border2)">
          <th style="text-align:left;padding:8px 0;color:var(--text3);font-weight:500">이름</th>
          <th style="text-align:center;padding:8px 0;color:var(--text3);font-weight:500">맞힘</th>
          <th style="text-align:center;padding:8px 0;color:var(--text3);font-weight:500">총경기</th>
          <th style="text-align:right;padding:8px 0;color:var(--text3);font-weight:500">적중률</th>
          <th style="text-align:center;padding:8px 0;color:var(--text3);font-weight:500">관리</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(r => {
          const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
          return `
            <tr style="border-bottom:1px solid var(--border)">
              <td style="padding:10px 0">${escapeHtml(r.name)}</td>
              <td style="text-align:center;color:var(--green)">${r.correct}</td>
              <td style="text-align:center">${r.total}</td>
              <td style="text-align:right;color:var(--accent)">${pct}%</td>
              <td style="text-align:center">
                <button class="del-btn" onclick='deleteUserRecord("${escapeHtml(r.name)}")'>
                  삭제
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  ul.innerHTML = tableHTML;
}

/**
 * 히스토리 렌더링
 */
export function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!container) return;

  const history = generateHistory();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding:40px 20px;color:var(--text3)">
        <p>예측 히스토리가 없어요</p>
      </div>
    `;
    return;
  }

  container.innerHTML = history
    .map(
      item => `
      <div class="match-card" style="max-width:760px;margin:0 auto 12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:12px;color:var(--text3)">${item.date}</span>
          <span style="font-size:12px;color:var(--accent);font-weight:700">${item.myPick || '미예측'} vs ${item.result || '미정'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:600">${escapeHtml(item.team1)} vs ${escapeHtml(item.team2)}</span>
          ${item.isCorrect ? '<span style="color:var(--green);font-weight:700">✓ 정답</span>' : '<span style="color:var(--red)">✗ 오답</span>'}
        </div>
      </div>
    `
    )
    .join('');
}

/**
 * 히스토리 생성
 */
function generateHistory() {
  if (Object.keys(mySubmittedPicks).length === 0) return [];

  return matches
    .filter(m => mySubmittedPicks[m.id])
    .map(m => ({
      team1: m.team1,
      team2: m.team2,
      date: selectedDateStr(),
      myPick: mySubmittedPicks[m.id],
      result: m.result || '미정',
      isCorrect:
        m.result &&
        m.result !== '무승부' &&
        m.result !== '경기취소' &&
        mySubmittedPicks[m.id] === m.result
    }));
}

/**
 * 랭킹 데이터 설정
 */
export function setRankings(data) {
  rankings = data || {};
}

/**
 * 현재 랭킹 반환
 */
export function getRankings() {
  return rankings;
}
