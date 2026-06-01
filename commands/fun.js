const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = [
  // ===== /골라 =====
  {
    data: new SlashCommandBuilder()
      .setName('골라')
      .setDescription('항목 중 하나를 무작위로 골라줘요')
      .addStringOption(o => o.setName('항목').setDescription('쉼표(,)로 구분').setRequired(true)),
    async execute(interaction) {
      const items = interaction.options.getString('항목').split(',').map(s => s.trim()).filter(Boolean);
      if (items.length < 2) return interaction.reply({ content: '2개 이상 입력해 주세요. 예) 짜장,짬뽕,볶음밥', ephemeral: true });
      const pick = items[Math.floor(Math.random() * items.length)];
      await interaction.reply(`🎯 골랐어요: **${pick}**`);
    },
  },

  // ===== /로또 =====
  {
    data: new SlashCommandBuilder()
      .setName('로또')
      .setDescription('로또 번호 6개를 뽑아줘요'),
    async execute(interaction) {
      const nums = new Set();
      while (nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
      const sorted = [...nums].sort((a, b) => a - b);
      const embed = new EmbedBuilder()
        .setTitle('🎱 로또 번호')
        .setColor(0xFF6B6B)
        .setDescription(`## ${sorted.join('  ·  ')}`)
        .setFooter({ text: '행운을 빌어요!' });
      await interaction.reply({ embeds: [embed] });
    },
  },

  // ===== /러시안 =====
  {
    data: new SlashCommandBuilder()
      .setName('러시안')
      .setDescription('러시안 룰렛 (6분의 1 확률)'),
    async execute(interaction) {
      const bullet = Math.floor(Math.random() * 6);
      const hit = bullet === 0;
      const embed = new EmbedBuilder()
        .setTitle('🔫 러시안 룰렛')
        .setColor(hit ? 0xED4245 : 0x57F287)
        .setDescription(hit
          ? `💥 **탕!** ${interaction.user} 님 당첨...`
          : `🔘 *철컥* — ${interaction.user} 님 살았어요!`);
      await interaction.reply({ embeds: [embed] });
    },
  },

  // ===== /범위주사위 (마냥 /주사위 스타일: 범위 내 숫자) =====
  {
    data: new SlashCommandBuilder()
      .setName('숫자뽑기')
      .setDescription('범위 내 무작위 숫자를 뽑아요')
      .addIntegerOption(o => o.setName('최소').setDescription('최소값').setRequired(true))
      .addIntegerOption(o => o.setName('최대').setDescription('최대값').setRequired(true)),
    async execute(interaction) {
      let min = interaction.options.getInteger('최소');
      let max = interaction.options.getInteger('최대');
      if (min > max) [min, max] = [max, min];
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      await interaction.reply(`🔢 ${min}~${max} 중에서: **${n}**`);
    },
  },
];
