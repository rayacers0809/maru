// 봇에 내장되는 설정 API 서버.
// 대시보드(Cloudflare Functions)가 이 엔드포인트를 호출해서 Firestore 설정을 읽고 쓴다.
// 인증: 대시보드와 공유하는 DASHBOARD_API_SECRET 헤더로 보호.
//
// 엔드포인트:
//   GET  /api/guild/:id   -> { config, channels }
//   POST /api/guild/:id   -> 설정 저장
// 모든 요청에 X-Api-Secret 헤더 필요.

const express = require('express');
const cors = require('cors');
const { getConfig, setConfig } = require('./lib/firestore');

function startApiServer(client) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const SECRET = process.env.DASHBOARD_API_SECRET;

  // 인증 미들웨어
  app.use('/api', (req, res, next) => {
    if (!SECRET) return res.status(500).json({ error: 'DASHBOARD_API_SECRET 미설정' });
    if (req.headers['x-api-secret'] !== SECRET) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    next();
  });

  // 설정 + 채널 목록 조회
  app.get('/api/guild/:id', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.id);
    if (!guild) return res.status(404).json({ error: '봇이 이 서버에 없습니다' });

    try {
      const config = await getConfig(guild.id);
      const channels = guild.channels.cache
        .filter(c => c.type === 0 || c.type === 2) // 0:텍스트 2:음성
        .map(c => ({ id: c.id, name: c.name, type: c.type }))
        .sort((a, b) => a.type - b.type);
      res.json({ config, channels, guildName: guild.name });
    } catch (e) {
      console.error('[api get]', e);
      res.status(500).json({ error: 'firestore error' });
    }
  });

  // 설정 저장
  app.post('/api/guild/:id', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.id);
    if (!guild) return res.status(404).json({ error: '봇이 이 서버에 없습니다' });

    try {
      // 화이트리스트 필드만 저장
      const body = req.body || {};
      const clean = {
        voiceLog: {
          enabled: !!body.voiceLog?.enabled,
          channelId: body.voiceLog?.channelId || null,
        },
        messageLog: {
          enabled: !!body.messageLog?.enabled,
          channelId: body.messageLog?.channelId || null,
        },
        welcome: {
          enabled: !!body.welcome?.enabled,
          channelId: body.welcome?.channelId || null,
          message: String(body.welcome?.message || '').slice(0, 500) || '{user} 님 환영합니다! 🎉',
        },
        swearFilter: { enabled: !!body.swearFilter?.enabled, action: 'delete' },
        spamFilter: {
          enabled: !!body.spamFilter?.enabled,
          threshold: Math.max(2, Math.min(20, +body.spamFilter?.threshold || 5)),
          seconds: Math.max(1, Math.min(60, +body.spamFilter?.seconds || 5)),
        },
      };
      await setConfig(guild.id, clean);
      res.json({ ok: true, config: clean });
    } catch (e) {
      console.error('[api post]', e);
      res.status(500).json({ error: 'firestore error' });
    }
  });

  // 헬스체크
  app.get('/health', (_req, res) => res.json({ ok: true, guilds: client.guilds.cache.size }));

  const port = process.env.API_PORT || 8080;
  app.listen(port, () => console.log(`🌐 설정 API 서버 실행 중 :${port}`));
}

module.exports = { startApiServer };
