const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const CHOICES = {
  rock: { name: '바위', emoji: '✊' },
  scissors: { name: '가위', emoji: '✌️' },
  paper: { name: '보', emoji: '✋' },
};

// 승패 판정: key가 value를 이김
const BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('가위바위보')
    .setDescription('봇과 가위바위보 한 판!')
    .addStringOption(opt =>
      opt.setName('선택')
        .setDescription('낼 것을 골라요')
        .setRequired(true)
        .addChoices(
          { name: '✊ 바위', value: 'rock' },
          { name: '✌️ 가위', value: 'scissors' },
          { name: '✋ 보', value: 'paper' },
        )),

  async execute(interaction) {
    const userPick = interaction.options.getString('선택');
    const keys = Object.keys(CHOICES);
    const botPick = keys[Math.floor(Math.random() * keys.length)];

    let result, color;
    if (userPick === botPick) {
      result = '🤝 비겼어요!';
      color = 0xFEE75C;
    } else if (BEATS[userPick] === botPick) {
      result = '🎉 당신이 이겼어요!';
      color = 0x57F287;
    } else {
      result = '😈 봇이 이겼어요!';
      color = 0xED4245;
    }

    const embed = new EmbedBuilder()
      .setTitle('✊✌️✋ 가위바위보')
      .setColor(color)
      .setDescription(
        `**${interaction.user.username}**: ${CHOICES[userPick].emoji} ${CHOICES[userPick].name}\n` +
        `**봇**: ${CHOICES[botPick].emoji} ${CHOICES[botPick].name}\n\n` +
        `### ${result}`
      );

    await interaction.reply({ embeds: [embed] });
  },
};
