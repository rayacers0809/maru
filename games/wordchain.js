// 끝말잇기 게임 로직 (한글 두음법칙 일부 허용)

// 두음법칙 매핑 (앞글자가 ㄹ/ㄴ로 시작할 때 허용되는 대체 초성 단어 연결용)
const DUEUM = {
  '라': ['나'], '락': ['낙'], '란': ['난'], '람': ['남'], '랑': ['낭'],
  '래': ['내'], '랭': ['냉'], '량': ['양'], '려': ['여'], '력': ['역'],
  '련': ['연'], '렬': ['열'], '령': ['영'], '례': ['예'], '로': ['노'],
  '록': ['녹'], '론': ['논'], '롱': ['농'], '료': ['요'], '룡': ['용'],
  '루': ['누'], '류': ['유'], '륙': ['육'], '률': ['율'], '리': ['이', '니'],
  '림': ['임', '님'], '립': ['입'], '니': ['이'],
};

function getValidStarts(lastChar) {
  const starts = new Set([lastChar]);
  if (DUEUM[lastChar]) DUEUM[lastChar].forEach(c => starts.add(c));
  return starts;
}

// 한글 단어인지 + 2글자 이상인지 검사
function isKoreanWord(word) {
  return /^[가-힣]{2,}$/.test(word);
}

/**
 * 끝말잇기 제출 검증
 * @returns { ok: boolean, reason?: string }
 */
function validateWord(state, word) {
  if (!isKoreanWord(word)) {
    return { ok: false, reason: '2글자 이상 한글 단어만 가능해요.' };
  }
  if (state.usedWords.has(word)) {
    return { ok: false, reason: `\`${word}\` 는 이미 나온 단어예요.` };
  }
  // 첫 단어가 아니면 끝글자 연결 검사
  if (state.lastWord) {
    const requiredChar = state.lastWord[state.lastWord.length - 1];
    const validStarts = getValidStarts(requiredChar);
    if (!validStarts.has(word[0])) {
      const hint = [...validStarts].join('/');
      return { ok: false, reason: `**${hint}** (으)로 시작해야 해요.` };
    }
  }
  return { ok: true };
}

function applyWord(state, word) {
  state.usedWords.add(word);
  state.lastWord = word;
  state.count += 1;
}

module.exports = { validateWord, applyWord, getValidStarts, isKoreanWord };
