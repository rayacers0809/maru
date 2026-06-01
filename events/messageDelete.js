const { Events, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../lib/firestore');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    // 봇 메시지, DM, 파셜(내용 없는 옛 메시지)은 스킵
    if (!message.guild) return;
    if (message.author?.bot) return;

    let cfg;
    try { cfg = await getConfig(message.guild.id); } catch { return; }
    if (!cfg.messageLog?.enabled || !cfg.messageLog.channelId) return;

    const logChannel = message.guild.channels.cache.get(cfg.messageLog.channelId);
    if (!logChannel) return;
    // 로그 채널에서 일어난 삭제는 기록 안 함 (무한 루프 방지)
    if (logChannel.id === message.channelId) return;

    const time = `<t:${Math.floor(Date.now() / 1000)}:T>`;
    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('🗑️ 메시지 삭제됨')
      .setTimestamp();

    // 작성자 정보 (캐시에 있으면)
    if (message.author) {
      embed.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
    }

    const fields = [
      { name: '채널', value: `<#${message.channelId}>`, inline: true },
      { name: '시각', value: time, inline: true },
    ];

    // 내용 (캐시에 있을 때만 — 봇 켜기 전 옛 메시지는 내용 못 가져옴)
    if (message.content) {
      embed.setDescription(message.content.slice(0, 4000));
    } else {
      embed.setDescription('*(내용을 가져올 수 없어요 — 봇 시작 전 메시지이거나 임베드/첨부만 있던 메시지)*');
    }

    // 첨부파일 있었으면 표시
    if (message.attachments?.size) {
      fields.push({
        name: '첨부파일',
        value: message.attachments.map(a => a.name || a.url).join('\n').slice(0, 1000),
      });
    }

    embed.addFields(fields);
    logChannel.send({ embeds: [embed] }).catch(() => {});
  },
};
