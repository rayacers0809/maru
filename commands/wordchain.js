const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('끝말잇기')
    .setDescription('끝말잇기 게임을 시작하거나 종료해요')
    .addSubcommand(sub =>
      sub.setName('시작').setDescription('이 채널에서 끝말잇기를 시작해요'))
    .addSubcommand(sub =>
      sub.setName('종료').setDescription('진행 중인 끝말잇기를 종료해요')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const channelId = interaction.channelId;
    const games = interaction.client.activeGames;

    if (sub === '시작') {
      const existing = games.get(channelId);
      if (existing && existing.type === 'wordchain') {
        return interaction.reply({ content: '⚠️ 이미 이 채널에서 끝말잇기가 진행 중이에요.', ephemeral: true });
      }
      games.set(channelId, {
        type: 'wordchain',
        usedWords: new Set(),
        lastWord: null,
        count: 0,
        starterId: interaction.user.id,
      });
      const embed = new EmbedBuilder()
        .setTitle('🔤 끝말잇기 시작!')
        .setColor(0x57F287)
        .setDescription(
          '아무나 2글자 이상 한글 단어를 채팅에 입력하면 시작돼요.\n' +
          '이미 나온 단어는 안 돼요. 두음법칙은 일부 허용해요.\n\n' +
          '종료하려면 `/끝말잇기 종료`'
        );
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === '종료') {
      const game = games.get(channelId);
      if (!game || game.type !== 'wordchain') {
        return interaction.reply({ content: '진행 중인 끝말잇기가 없어요.', ephemeral: true });
      }
      games.delete(channelId);
      const embed = new EmbedBuilder()
        .setTitle('🏁 끝말잇기 종료')
        .setColor(0xED4245)
        .setDescription(`총 **${game.count}개**의 단어가 이어졌어요!\n마지막 단어: **${game.lastWord ?? '없음'}**`);
      return interaction.reply({ embeds: [embed] });
    }
  },
};
