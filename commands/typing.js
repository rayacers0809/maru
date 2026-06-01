const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pickWord } = require('../games/typing');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('타자게임')
    .setDescription('제시어를 가장 빠르고 정확하게 입력하세요!'),

  async execute(interaction) {
    const channelId = interaction.channelId;
    const games = interaction.client.activeGames;

    const existing = games.get(channelId);
    if (existing && existing.type === 'typing') {
      return interaction.reply({ content: '⚠️ 이미 이 채널에서 타자게임이 진행 중이에요.', ephemeral: true });
    }

    const word = pickWord();
    games.set(channelId, {
      type: 'typing',
      word,
      startTime: Date.now(),
    });

    const embed = new EmbedBuilder()
      .setTitle('⌨️ 타자게임 시작!')
      .setColor(0x5865F2)
      .setDescription(
        '아래 제시어를 그대로 채팅에 입력하세요. 가장 먼저 맞춘 사람이 승리!\n\n' +
        `## \`${word}\``
      )
      .setFooter({ text: '띄어쓰기까지 똑같이 입력하세요' });

    await interaction.reply({ embeds: [embed] });
  },
};
