const { Events, EmbedBuilder } = require('discord.js');
const { validateWord, applyWord } = require('../games/wordchain');
const { calcAccuracy } = require('../games/typing');
const { getConfig } = require('../lib/firestore');
const { containsBadWord, isSpam } = require('../lib/filters');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // ===== 욕설/도배 필터 (대시보드 설정 기반) =====
    try {
      const cfg = await getConfig(message.guild.id);

      // 관리자는 필터 면제
      const isMod = message.member?.permissions.has('ManageMessages');

      if (!isMod && cfg.swearFilter?.enabled && containsBadWord(message.content)) {
        await message.delete().catch(() => {});
        const warn = await message.channel.send(`${message.author} 비속어가 감지되어 메시지를 삭제했어요.`).catch(() => null);
        if (warn) setTimeout(() => warn.delete().catch(() => {}), 4000);
        return;
      }

      if (!isMod && cfg.spamFilter?.enabled) {
        const { threshold = 5, seconds = 5 } = cfg.spamFilter;
        if (isSpam(message.author.id, message.channelId, threshold, seconds)) {
          await message.member?.timeout(60 * 1000, '도배 감지').catch(() => {});
          const warn = await message.channel.send(`${message.author} 도배가 감지되어 1분간 타임아웃됐어요.`).catch(() => null);
          if (warn) setTimeout(() => warn.delete().catch(() => {}), 4000);
          return;
        }
      }
    } catch { /* Firestore 미연결 시 필터 스킵 */ }

    const games = message.client.activeGames;
    const game = games.get(message.channelId);
    if (!game) return;

    const content = message.content.trim();

    // ===== 끝말잇기 =====
    if (game.type === 'wordchain') {
      // 명령어처럼 보이거나 공백 포함이면 무시
      if (!content || content.includes(' ') || content.startsWith('/')) return;

      const result = validateWord(game, content);
      if (!result.ok) {
        // 첫 글자 연결 실패만 가볍게 알려주고, 잡담은 무시
        if (/^[가-힣]{2,}$/.test(content)) {
          message.reply({ content: `❌ ${result.reason}`, allowedMentions: { repliedUser: false } });
        }
        return;
      }

      applyWord(game, content);
      message.react('✅').catch(() => {});

      const lastChar = content[content.length - 1];
      // 50단어마다 격려 메시지
      if (game.count % 10 === 0) {
        message.channel.send(`🔥 벌써 **${game.count}단어**째! 다음은 **${lastChar}** (으)로 시작!`);
      }
      return;
    }

    // ===== 타자게임 =====
    if (game.type === 'typing') {
      if (content === game.word) {
        const elapsed = (Date.now() - game.startTime) / 1000;
        games.delete(message.channelId);

        const embed = new EmbedBuilder()
          .setTitle('🏆 타자게임 정답!')
          .setColor(0x57F287)
          .setDescription(
            `**${message.author.username}** 님 정답!\n\n` +
            `제시어: \`${game.word}\`\n` +
            `⏱️ 기록: **${elapsed.toFixed(2)}초**`
          );
        message.channel.send({ embeds: [embed] });
      } else if (/^[가-힣a-zA-Z0-9]/.test(content)) {
        // 비슷하게 친 경우 정확도 힌트 (정답 아닐 때만)
        const acc = calcAccuracy(game.word, content);
        if (acc >= 50 && acc < 100) {
          message.react('🔸').catch(() => {});
        }
      }
      return;
    }
  },
};
