const {
  SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits,
} = require('discord.js');

module.exports = [
  // ===== /청소 =====
  {
    data: new SlashCommandBuilder()
      .setName('청소')
      .setDescription('채팅 메시지를 삭제해요')
      .addIntegerOption(o => o.setName('개수').setDescription('삭제할 개수 (1~100)').setRequired(true).setMinValue(1).setMaxValue(100))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
      const count = interaction.options.getInteger('개수');
      await interaction.channel.bulkDelete(count, true).catch(() => null);
      await interaction.reply({ content: `🧹 ${count}개 메시지를 삭제했어요.`, ephemeral: true });
    },
  },

  // ===== /뮤트 (타임아웃) =====
  {
    data: new SlashCommandBuilder()
      .setName('뮤트')
      .setDescription('유저의 채팅을 일정 시간 금지해요 (타임아웃)')
      .addUserOption(o => o.setName('유저').setDescription('대상').setRequired(true))
      .addIntegerOption(o => o.setName('분').setDescription('금지할 시간(분)').setRequired(true).setMinValue(1).setMaxValue(40320))
      .addStringOption(o => o.setName('사유').setDescription('사유'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
      const member = interaction.options.getMember('유저');
      const min = interaction.options.getInteger('분');
      const reason = interaction.options.getString('사유') ?? '없음';
      if (!member) return interaction.reply({ content: '유저를 찾을 수 없어요.', ephemeral: true });
      try {
        await member.timeout(min * 60 * 1000, reason);
        await interaction.reply(`🔇 **${member.user.tag}** 를 ${min}분간 뮤트했어요.\n사유: ${reason}`);
      } catch {
        await interaction.reply({ content: '❌ 뮤트 실패 (봇 권한/역할 순서 확인).', ephemeral: true });
      }
    },
  },

  // ===== /뮤트해제 =====
  {
    data: new SlashCommandBuilder()
      .setName('뮤트해제')
      .setDescription('유저의 타임아웃을 해제해요')
      .addUserOption(o => o.setName('유저').setDescription('대상').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
      const member = interaction.options.getMember('유저');
      if (!member) return interaction.reply({ content: '유저를 찾을 수 없어요.', ephemeral: true });
      await member.timeout(null).catch(() => null);
      await interaction.reply(`🔊 **${member.user.tag}** 뮤트를 해제했어요.`);
    },
  },

  // ===== /킥 =====
  {
    data: new SlashCommandBuilder()
      .setName('킥')
      .setDescription('유저를 서버에서 추방해요')
      .addUserOption(o => o.setName('유저').setDescription('대상').setRequired(true))
      .addStringOption(o => o.setName('사유').setDescription('사유'))
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
      const member = interaction.options.getMember('유저');
      const reason = interaction.options.getString('사유') ?? '없음';
      if (!member) return interaction.reply({ content: '유저를 찾을 수 없어요.', ephemeral: true });
      try {
        await member.kick(reason);
        await interaction.reply(`👢 **${member.user.tag}** 를 추방했어요.\n사유: ${reason}`);
      } catch {
        await interaction.reply({ content: '❌ 추방 실패 (봇 권한/역할 순서 확인).', ephemeral: true });
      }
    },
  },

  // ===== /잠금 =====
  {
    data: new SlashCommandBuilder()
      .setName('잠금')
      .setDescription('현재 채널 메시지 보내기를 잠그거나 풀어요')
      .addBooleanOption(o => o.setName('해제').setDescription('true면 잠금 해제'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      const unlock = interaction.options.getBoolean('해제') ?? false;
      const everyone = interaction.guild.roles.everyone;
      await interaction.channel.permissionOverwrites.edit(everyone, {
        SendMessages: unlock ? null : false,
      });
      await interaction.reply(unlock ? '🔓 채널 잠금을 해제했어요.' : '🔒 채널을 잠갔어요.');
    },
  },

  // ===== /슬로우 =====
  {
    data: new SlashCommandBuilder()
      .setName('슬로우')
      .setDescription('채널 슬로우 모드를 설정해요')
      .addIntegerOption(o => o.setName('초').setDescription('0~21600초, 0이면 해제').setRequired(true).setMinValue(0).setMaxValue(21600))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      const sec = interaction.options.getInteger('초');
      await interaction.channel.setRateLimitPerUser(sec);
      await interaction.reply(sec === 0 ? '🐇 슬로우 모드를 해제했어요.' : `🐢 슬로우 모드 ${sec}초로 설정했어요.`);
    },
  },
];
