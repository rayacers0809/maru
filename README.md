# 마루 (Maru) 🐩

비숑 마스코트 디스코드 봇. 음성로그 + 미니게임 + 관리 + 웹 대시보드.

## 기능

### 음성 로그
음성채널 입장/퇴장/이동을 지정 채널에 임베드로 기록 (대시보드에서 on/off).

### 관리
`/청소` `/뮤트` `/뮤트해제` `/킥` `/잠금` `/슬로우` `/경고`(부여·조회·삭제, Firestore 저장)

### 게임
`/가위바위보` `/주사위` `/끝말잇기` `/타자게임` `/골라` `/로또` `/러시안` `/숫자뽑기`
`/경마` `/숫자야구` `/반응속도` `/투표`

### 유틸 / 기타
`/계산` `/시간` `/내정보` `/아바타` `/서버정보` `/출석` `/출석순위` `/도움말`

### 자동 기능 (대시보드 설정)
- 환영 메시지 (새 멤버 입장 시)
- 욕설 필터 (자동 삭제)
- 도배 방지 (연속 메시지 차단)

### 🎵 음악 (준비 중)
`/재생` `/스킵` `/정지` `/일시정지` `/대기열` 명령어는 등록돼 있지만 현재 "준비 중" 안내만 표시.
유튜브 직접 추출(discord-player)은 차단 이슈로 제거함. 추후 **Lavalink** 연동으로 추가 예정.
연동 시 `commands/music-placeholder.js` 를 실제 음악 명령어로 교체하면 됨.

---

## 설치

### 1. Node.js 18+
(음악 제거로 FFmpeg는 더 이상 필수 아님)

### 2. 패키지
```bash
npm install
```

### 3. .env
`.env.example` 복사 후 값 채우기:
```bash
cp .env.example .env
```
DISCORD_TOKEN, CLIENT_ID, GUILD_ID 등 입력.

### 4. Firebase
`serviceAccountKey.json` 을 루트에 두면 자동 인식.

### 5. 개발자 포털 인텐트
**SERVER MEMBERS**, **MESSAGE CONTENT** 켜기.

### 6. 명령어 등록 + 실행
```bash
npm run deploy   # 슬래시 명령어 등록
npm start        # 봇 실행
```

---

## 대시보드 연동
별도 maru-dashboard(Cloudflare Pages)와 연동. `.env`의 `DASHBOARD_API_SECRET` 을
대시보드 환경변수와 동일하게 맞추고, 오라클 방화벽에서 `API_PORT`(기본 8080) 인바운드 허용.

## 구조
```
maru-bot/
├── index.js              메인 (client + Firestore + API서버 기동)
├── api-server.js         대시보드용 설정 API (Express)
├── deploy-commands.js    슬래시 명령어 등록
├── commands/             슬래시 명령어 (음악은 music-placeholder.js)
├── events/               voiceStateUpdate / guildMemberAdd / message / interaction
├── games/                끝말잇기·타자 로직
└── lib/                  firestore.js, filters.js
```
