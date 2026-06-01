const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('도움말')
    .setDescription('마루의 명령어 목록을 봐요'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x8B9DF0) // 마루 블루
      .setTitle('🐩 마루 명령어')
      .setDescription('비숑 마루가 도와드릴게요!')
      .addFields(
        { name: '🛡️ 관리', value: '`/청소` `/뮤트` `/뮤트해제` `/킥` `/잠금` `/슬로우` `/경고`' },
        { name: '🎮 게임', value: '`/가위바위보` `/주사위` `/끝말잇기` `/타자게임` `/골라` `/로또` `/러시안` `/숫자뽑기` `/경마` `/숫자야구` `/반응속도` `/투표`' },
        { name: '🎵 음악', value: '`/재생` `/스킵` `/정지` `/일시정지` `/대기열` (준비 중)' },
        { name: '🔧 유틸', value: '`/계산` `/시간` `/내정보` `/아바타` `/서버정보`' },
        { name: '📅 기타', value: '`/출석` `/출석순위`' },
      )
      .setFooter({ text: '음성로그·환영·필터는 대시보드에서 설정하세요' });

    if (interaction.client.user.displayAvatarURL) {
      embed.setThumbnail(interaction.client.user.displayAvatarURL());
    }

    await interaction.reply({ embeds: [embed] });
  },
};
