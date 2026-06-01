require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events, Partials } = require('discord.js');
const firestore = require('./lib/firestore');

// Firestore 연결 (서비스 계정 키 없으면 경고만 출력하고 계속)
try {
  firestore.init();
} catch (e) {
  console.warn('⚠️  Firestore 미연결 (serviceAccountKey.json 또는 FIREBASE_SERVICE_ACCOUNT 필요). 음성로그/필터/출석 등 Firestore 기능은 비활성화됩니다.');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,   // 음성로그에 필수
    GatewayIntentBits.GuildMembers,       // 멤버 정보
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,     // 끝말잇기/타자게임 + 메시지 로그
  ],
  // 캐시 안 된(봇 시작 전) 메시지의 삭제/수정도 일부 잡으려면 Partials 필요
  partials: [Partials.Message, Partials.Channel],
});

// ===== 슬래시 명령어 로드 =====
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const mod = require(path.join(commandsPath, file));
  const list = Array.isArray(mod) ? mod : [mod];
  for (const command of list) {
    if (command && 'data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

// ===== 진행 중인 채팅 게임 상태 저장 (메모리) =====
client.activeGames = new Collection();

// ===== 이벤트 로드 (voiceStateUpdate, interactionCreate, messageCreate 등) =====
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args));
  else client.on(event.name, (...args) => event.execute(...args));
}

client.once(Events.ClientReady, c => {
  console.log(`✅ 마루 로그인 완료: ${c.user.tag}`);
  c.user.setPresence({
    activities: [{ name: '🐩 /도움말', type: 3 }], // type 3 = Watching
    status: 'online',
  });
  // 대시보드 설정 API 서버 시작
  if (process.env.DASHBOARD_API_SECRET) {
    try {
      const { startApiServer } = require('./api-server');
      startApiServer(c);
    } catch (e) {
      console.error('API 서버 시작 실패:', e.message);
    }
  } else {
    console.log('ℹ️  DASHBOARD_API_SECRET 미설정 → 대시보드 API 비활성화 (봇 기능은 정상)');
  }
});

client.login(process.env.DISCORD_TOKEN);
