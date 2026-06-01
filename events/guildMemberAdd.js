const { Events, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../lib/firestore');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    let cfg;
    try { cfg = await getConfig(member.guild.id); } catch { return; }
    if (!cfg.welcome?.enabled || !cfg.welcome.channelId) return;

    const channel = member.guild.channels.cache.get(cfg.welcome.channelId);
    if (!channel) return;

    const text = (cfg.welcome.message || '{user} 님 환영합니다! 🎉')
      .replace(/{user}/g, member.toString())
      .replace(/{username}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{count}/g, member.guild.memberCount);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(text)
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: `${member.guild.memberCount}번째 멤버` });

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
