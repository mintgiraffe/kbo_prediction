/**
 * Firebase Integration Module
 * 데이터베이스 연결 및 데이터 작업 관리
 */

// Firebase 설정
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  update,
  onValue,
  off
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

let db = null;
let dbRef = null;

/**
 * Firebase 초기화
 */
export function initFirebase(databaseURL) {
  const firebaseConfig = {
    databaseURL: databaseURL
  };

  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    connStatus.show('online');
    console.log('Firebase initialized');
  } catch (err) {
    console.error('Firebase init error:', err);
    connStatus.show('offline');
    toast('Firebase 연결 실패', 'error');
  }
}

/**
 * 데이터베이스 연결 상태 확인
 */
export function getDB() {
  return db;
}

/**
 * 경기 데이터 저장
 */
export async function saveMatchesToDB(matches) {
  if (!db) {
    toast('Firebase 연결 필요', 'error');
    return false;
  }

  try {
    await set(ref(db, currentKey()), {
      matches: matches,
      participants: matches.participants || {},
      timestamp: new Date().getTime()
    });
    return true;
  } catch (err) {
    console.error('Save error:', err);
    toast('저장 실패', 'error');
    return false;
  }
}

/**
 * 경기 데이터 조회
 */
export async function getMatchesFromDB() {
  if (!db) {
    console.warn('Firebase not initialized');
    return null;
  }

  try {
    const snapshot = await get(ref(db, currentKey()));
    return snapshot.val();
  } catch (err) {
    console.error('Get error:', err);
    return null;
  }
}

/**
 * 실시간 데이터 리스너 설정
 */
export function listenToMatches(callback) {
  if (!db) {
    console.warn('Firebase not initialized');
    return () => {};
  }

  const unsubscribe = onValue(
    ref(db, currentKey()),
    snapshot => {
      const data = snapshot.val();
      callback(data);
    },
    err => {
      console.error('Listen error:', err);
      connStatus.show('offline');
    }
  );

  return unsubscribe;
}

/**
 * 사용자 예측 저장
 */
export async function saveUserPicks(userName, picks) {
  if (!db) {
    toast('Firebase 연결 필요', 'error');
    return false;
  }

  try {
    await set(
      ref(db, `${currentKey()}/participants/${userName}`),
      {
        name: userName,
        picks: picks,
        correct: 0,
        total: 0,
        timestamp: new Date().getTime()
      }
    );
    return true;
  } catch (err) {
    console.error('Save picks error:', err);
    toast('예측 저장 실패', 'error');
    return false;
  }
}

/**
 * 사용자 레코드 삭제
 */
export async function deleteUserRecord(userName) {
  if (!db) {
    toast('Firebase 연결 필요', 'error');
    return false;
  }

  try {
    await remove(ref(db, `${currentKey()}/participants/${userName}`));
    return true;
  } catch (err) {
    console.error('Delete error:', err);
    toast('삭제 실패', 'error');
    return false;
  }
}

/**
 * 결과 업데이트 및 점수 계산
 */
export async function updateResultsAndScores(matches, rankings) {
  if (!db) {
    toast('Firebase 연결 필요', 'error');
    return false;
  }

  try {
    const updatesObj = {};

    // matches 데이터 업데이트
    updatesObj[`${currentKey()}/matches`] = matches;

    // 각 사용자 점수 계산
    Object.values(rankings).forEach(r => {
      const userPicks = r.picks || {};

      const scoredMatches = matches.filter(m =>
        m.result !== '무승부' &&
        m.result !== '경기취소' &&
        userPicks[m.id]
      );

      const correct = scoredMatches.filter(
        m => m.result && userPicks[m.id] === m.result
      ).length;

      updatesObj[`${currentKey()}/participants/${r.name}/correct`] = correct;
      updatesObj[`${currentKey()}/participants/${r.name}/total`] =
        scoredMatches.length;
    });

    if (Object.keys(updatesObj).length > 0) {
      await update(ref(db), updatesObj);
    }

    return true;
  } catch (err) {
    console.error('Update error:', err);
    toast('점수 계산 실패', 'error');
    return false;
  }
}

/**
 * 전체 데이터 초기화 (위험함)
 */
export async function resetAllData() {
  if (!db) {
    toast('Firebase 연결 필요', 'error');
    return false;
  }

  try {
    await remove(ref(db, currentKey()));
    return true;
  } catch (err) {
    console.error('Reset error:', err);
    toast('데이터 초기화 실패', 'error');
    return false;
  }
}

/**
 * 배치 업데이트 (여러 사용자 업데이트)
 */
export async function batchUpdate(updates) {
  if (!db) {
    toast('Firebase 연결 필요', 'error');
    return false;
  }

  try {
    await update(ref(db), updates);
    return true;
  } catch (err) {
    console.error('Batch update error:', err);
    toast('일괄 업데이트 실패', 'error');
    return false;
  }
}
