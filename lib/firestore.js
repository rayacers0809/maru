// Firestore 연결 + 서버별 설정 캐싱
// 대시보드(Cloudflare)와 봇(Oracle)이 같은 Firestore를 공유한다.
//
// 컬렉션 구조:
//   guilds/{guildId}              -> 서버 설정 (음성로그, 욕설필터, 환영메시지 등)
//   guilds/{guildId}/warns/{id}   -> 경고 기록
//   guilds/{guildId}/attendance/{userId} -> 출석
//   guilds/{guildId}/reactionRoles/{messageId} -> 반응역할

const admin = require('firebase-admin');

let db = null;

function init() {
  if (admin.apps.length) {
    db = admin.firestore();
    return db;
  }

  // 서비스 계정 키: 환경변수(FIREBASE_SERVICE_ACCOUNT, JSON 문자열) 또는 파일
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(json);
  } else {
    // 루트의 serviceAccountKey.json 사용
    const serviceAccount = require('../serviceAccountKey.json');
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });
  db = admin.firestore();
  console.log('🔥 Firestore 연결 완료');
  return db;
}

// 기본 설정값
const DEFAULT_CONFIG = {
  voiceLog: { enabled: false, channelId: null },
  welcome: { enabled: false, channelId: null, message: '{user} 님 환영합니다! 🎉' },
  swearFilter: { enabled: false, action: 'delete' }, // delete | warn
  spamFilter: { enabled: false, threshold: 5, seconds: 5 },
};

// 설정 캐시 (guildId -> config), 30초 TTL
const cache = new Map();
const TTL = 30 * 1000;

async function getConfig(guildId) {
  const cached = cache.get(guildId);
  if (cached && Date.now() - cached.at < TTL) return cached.data;

  if (!db) init();
  const snap = await db.collection('guilds').doc(guildId).get();
  const data = snap.exists
    ? { ...DEFAULT_CONFIG, ...snap.data() }
    : { ...DEFAULT_CONFIG };

  cache.set(guildId, { data, at: Date.now() });
  return data;
}

// 캐시 무효화 (대시보드에서 바뀐 직후 강제 새로고침용)
function invalidate(guildId) {
  cache.delete(guildId);
}

async function setConfig(guildId, partial) {
  if (!db) init();
  await db.collection('guilds').doc(guildId).set(partial, { merge: true });
  invalidate(guildId);
}

function getDb() {
  if (!db) init();
  return db;
}

module.exports = { init, getConfig, setConfig, invalidate, getDb, DEFAULT_CONFIG };
