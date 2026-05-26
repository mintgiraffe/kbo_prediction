# KBO 예측

KBO 야구 경기 결과를 친구들끼리 매일 예측하고 점수 매기는 사이트.

🔗 **배포:** [kbo-prediction.vercel.app](https://kbo-prediction.vercel.app)

## 사용법

1. 닉네임 + 4자리 비밀번호로 입장 (처음 들어오면 자동으로 새 계정 생성)
2. 그날 경기 카드에서 이길 팀 선택
3. **예측 제출하기** 버튼 클릭
4. 경기가 끝나면 관리자가 결과 입력 → 자동 채점 → 랭킹 갱신
5. 누적 랭킹 탭에서 전체 기간 점수 확인

## 스택

- HTML / Vanilla JavaScript (single-file)
- Firebase Realtime Database (데이터 저장)
- Vercel (배포)

## 로컬 실행

별도 빌드 없이 `index.html`을 그대로 열면 동작합니다.

```bash
git clone https://github.com/mintgiraffe/kbo_prediction.git
cd kbo_prediction
# 브라우저로 index.html 열기
```

## 데이터 구조

```
kbo_YYYY-MM-DD/
├── matches/            # 그날 경기 목록
│   └── [i]: { team1, team2, pitcher1, pitcher2, time, stadium, result, ... }
└── participants/
    └── {닉네임}: { name, pw, correct, total, picks, submittedAt }
```
