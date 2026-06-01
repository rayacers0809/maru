const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// 음악 기능은 추후 Lavalink 연동 예정. 지금은 안내만 표시.
// Lavalink 붙일 때 이 파일을 실제 음악 명령어로 교체하면 됨.
function notReady(name) {
  return {
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(`[준비 중] ${name} - 음악 기능은 추후 추가됩니다`),
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setColor(0x8B9DF0)
        .setTitle('🎵 음악 기능 준비 중')
        .setDescription('음악 기능은 안정적인 재생을 위해 준비 중이에요.\n곧 추가될 예정이니 조금만 기다려 주세요! 🐩');
      await interaction.reply({ embeds: [embed], ephemeral: true });
    },
  };
}

module.exports = [
  notReady('재생'),
  notReady('스킵'),
  notReady('정지'),
  notReady('일시정지'),
  notReady('대기열'),
];
