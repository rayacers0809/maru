const { Events, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../lib/firestore');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild) return;
    if (newMessage.author?.bot) return;
    // 내용 변화 없으면 스킵 (임베드 펼침 등으로도 이벤트가 뜸)
    if (oldMessage.content === newMessage.content) return;

    let cfg;
    try { cfg = await getConfig(newMessage.guild.id); } catch { return; }
    if (!cfg.messageLog?.enabled || !cfg.messageLog.channelId) return;

    const logChannel = newMessage.guild.channels.cache.get(cfg.messageLog.channelId);
    if (!logChannel) return;
    if (logChannel.id === newMessage.channelId) return;

    const time = `<t:${Math.floor(Date.now() / 1000)}:T>`;
    const embed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle('✏️ 메시지 수정됨')
      .setTimestamp();

    if (newMessage.author) {
      embed.setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL() });
    }

    embed.addFields(
      { name: '이전', value: (oldMessage.content || '*(가져올 수 없음)*').slice(0, 1024) },
      { name: '이후', value: (newMessage.content || '*(없음)*').slice(0, 1024) },
      { name: '채널', value: `<#${newMessage.channelId}>`, inline: true },
      { name: '시각', value: time, inline: true },
      { name: '바로가기', value: `[메시지로 이동](${newMessage.url})`, inline: true },
    );

    logChannel.send({ embeds: [embed] }).catch(() => {});
  },
};
