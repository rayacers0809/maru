// 욕설 필터 + 도배(스팸) 필터
// 욕설 단어는 기본 리스트 + 대시보드에서 추가 가능(향후). 여기선 기본 리스트.

const BAD_WORDS = [
  // 필요에 맞게 보강. 우회표현 일부 대응 위해 단순 포함 검사.
  '시발', '씨발', 'ㅅㅂ', '병신', 'ㅂㅅ', '지랄', '좆', '개새끼', '새끼',
  '닥쳐', '꺼져', 'fuck', 'shit', 'bitch',
];

function normalize(text) {
  return text.toLowerCase().replace(/[\s.\-_*]/g, '');
}

function containsBadWord(text) {
  const n = normalize(text);
  return BAD_WORDS.some(w => n.includes(normalize(w)));
}

// 도배 추적: userId+channelId 별 최근 메시지 타임스탬프
const recent = new Map(); // key -> number[]

function isSpam(userId, channelId, threshold, seconds) {
  const key = `${userId}:${channelId}`;
  const now = Date.now();
  const windowMs = seconds * 1000;
  const arr = (recent.get(key) || []).filter(t => now - t < windowMs);
  arr.push(now);
  recent.set(key, arr);
  return arr.length >= threshold;
}

module.exports = { containsBadWord, isSpam };
