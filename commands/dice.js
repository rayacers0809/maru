const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('주사위')
    .setDescription('주사위를 굴려요')
    .addIntegerOption(opt =>
      opt.setName('개수')
        .setDescription('굴릴 주사위 개수 (1~10, 기본 1)')
        .setMinValue(1)
        .setMaxValue(10))
    .addIntegerOption(opt =>
      opt.setName('면')
        .setDescription('주사위 면 수 (기본 6)')
        .setMinValue(2)
        .setMaxValue(100)),

  async execute(interaction) {
    const count = interaction.options.getInteger('개수') ?? 1;
    const sides = interaction.options.getInteger('면') ?? 6;

    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    const total = rolls.reduce((a, b) => a + b, 0);

    // 6면체면 주사위 이모지, 아니면 숫자로
    const display = sides === 6
      ? rolls.map(r => DICE_FACES[r]).join(' ')
      : rolls.join(', ');

    const embed = new EmbedBuilder()
      .setTitle('🎲 주사위')
      .setColor(0x5865F2)
      .setDescription(
        `**${interaction.user.username}** 님이 ${count}개의 ${sides}면 주사위를 굴렸어요!\n\n` +
        `${display}\n\n` +
        (count > 1 ? `### 합계: ${total}` : `### 결과: ${total}`)
      );

    await interaction.reply({ embeds: [embed] });
  },
};
