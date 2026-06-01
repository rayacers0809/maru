// 타자게임 - 제시어 풀과 정확도/속도 계산

const WORDS = [
  '리얼리티', '로블록스', '디스코드', '프로그래밍',
  '키보드워리어', '타자연습', '순간이동', '롤플레잉', '커뮤니티',
  '청기백기', '무지개색깔', '초콜릿쿠키', '아이스아메리카노', '주말여행',
  '컴퓨터공학', '인공지능', '데이터베이스', '클라우드', '네트워크',
  '바닐라라떼', '딸기케이크', '치즈버거', '감자튀김', '불고기피자',
  '겨울왕국', '여름방학', '봄소풍', '가을단풍', '눈사람만들기',
];

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// 두 문자열의 정확도(%) 계산 (단순 문자 일치 비율)
function calcAccuracy(target, input) {
  if (!input) return 0;
  let match = 0;
  const len = Math.max(target.length, input.length);
  for (let i = 0; i < Math.min(target.length, input.length); i++) {
    if (target[i] === input[i]) match++;
  }
  return Math.round((match / len) * 100);
}

module.exports = { pickWord, calcAccuracy };
