// Firestore 연결 + 서버별 설정 캐싱
// 대시보드(Cloudflare)와 봇(Oracle)이 같은 Firestore를 공유한다.
//
// 컬렉션 구조:
//   guilds/{guildId}              -> 서버 설정 (음성로그, 욕설필터, 환영메시지 등)
//   guilds/{guildId}/warns/{id}   -> 경고 기록
//   guilds/{guildId}/attendance/{userId} -> 출석
//   guilds/{guildId}/reactionRoles/{messageId} -> 반응역할

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

let db = null;

function init() {
  // DB 이름: .env의 FIRESTORE_DB (없으면 'maru'). '(default)' 쓰려면 default 로 지정.
  const dbName = process.env.FIRESTORE_DB || 'maru';

  if (admin.apps.length) {
    db = getDbHandle(dbName);
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
  db = getDbHandle(dbName);
  console.log(`🔥 Firestore 연결 완료 (DB: ${dbName})`);
  return db;
}

// '(default)' 또는 default 이면 기본 DB, 그 외엔 named DB
function getDbHandle(dbName) {
  if (!dbName || dbName === 'default' || dbName === '(default)') {
    return getFirestore();
  }
  return getFirestore(dbName);
}

// 기본 설정값
const DEFAULT_CONFIG = {
  voiceLog: { enabled: false, channelId: null },
  messageLog: { enabled: false, channelId: null }, // 메시지 삭제/수정 로그
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
