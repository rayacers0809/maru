const { Events, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../lib/firestore');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild;

    let cfg;
    try { cfg = await getConfig(guild.id); } catch { return; }
    if (!cfg.voiceLog?.enabled) return;

    const logChannelId = cfg.voiceLog.channelId || process.env.VOICE_LOG_CHANNEL_ID;
    if (!logChannelId) return;
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const member = newState.member ?? oldState.member;
    if (!member) return;

    const time = `<t:${Math.floor(Date.now() / 1000)}:T>`;
    const embed = new EmbedBuilder()
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .setTimestamp();

    if (!oldState.channelId && newState.channelId) {
      embed.setColor(0x57F287).setTitle('🔊 음성채널 입장')
        .setDescription(`${member} 님이 **${newState.channel.name}** 에 입장했어요.\n${time}`);
    } else if (oldState.channelId && !newState.channelId) {
      embed.setColor(0xED4245).setTitle('🔇 음성채널 퇴장')
        .setDescription(`${member} 님이 **${oldState.channel.name}** 에서 나갔어요.\n${time}`);
    } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      embed.setColor(0xFEE75C).setTitle('↔️ 음성채널 이동')
        .setDescription(`${member} 님이 이동했어요.\n**${oldState.channel.name}** → **${newState.channel.name}**\n${time}`);
    } else {
      return;
    }

    logChannel.send({ embeds: [embed] }).catch(() => {});
  },
};
