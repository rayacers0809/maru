const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// 안전한 수식 계산 (eval 금지 - 사칙연산/괄호/소수만 허용)
function safeCalc(expr) {
  if (!/^[\d+\-*/().\s]+$/.test(expr)) throw new Error('허용되지 않은 문자');
  // Function 생성자로 평가하되 입력을 화이트리스트로 제한했으므로 안전
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${expr});`)();
  if (typeof result !== 'number' || !isFinite(result)) throw new Error('계산 불가');
  return result;
}

module.exports = [
  // ===== /계산 =====
  {
    data: new SlashCommandBuilder()
      .setName('계산')
      .setDescription('사칙연산을 계산해요')
      .addStringOption(o => o.setName('수식').setDescription('예) (3+4)*2 / 5').setRequired(true)),
    async execute(interaction) {
      const expr = interaction.options.getString('수식');
      try {
        const r = safeCalc(expr);
        await interaction.reply(`🧮 \`${expr}\` = **${r}**`);
      } catch {
        await interaction.reply({ content: '❌ 계산할 수 없는 수식이에요. (사칙연산만 가능)', ephemeral: true });
      }
    },
  },

  // ===== /시간 =====
  {
    data: new SlashCommandBuilder()
      .setName('시간')
      .setDescription('주요 도시의 현재 시간을 보여줘요'),
    async execute(interaction) {
      const zones = [
        ['🇰🇷 서울', 'Asia/Seoul'],
        ['🇯🇵 도쿄', 'Asia/Tokyo'],
        ['🇹🇭 방콕', 'Asia/Bangkok'],
        ['🇬🇧 런던', 'Europe/London'],
        ['🇺🇸 뉴욕', 'America/New_York'],
        ['🇺🇸 LA', 'America/Los_Angeles'],
      ];
      const fmt = tz => new Intl.DateTimeFormat('ko-KR', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: true,
      }).format(new Date());
      const embed = new EmbedBuilder()
        .setTitle('🕐 세계 시간')
        .setColor(0x5865F2)
        .setDescription(zones.map(([n, tz]) => `**${n}** — ${fmt(tz)}`).join('\n'));
      await interaction.reply({ embeds: [embed] });
    },
  },

  // ===== /내정보 =====
  {
    data: new SlashCommandBuilder()
      .setName('내정보')
      .setDescription('유저 정보를 보여줘요')
      .addUserOption(o => o.setName('유저').setDescription('대상 (기본: 본인)')),
    async execute(interaction) {
      const user = interaction.options.getUser('유저') ?? interaction.user;
      const member = interaction.guild.members.cache.get(user.id);
      const embed = new EmbedBuilder()
        .setTitle(`👤 ${user.tag}`)
        .setColor(0x5865F2)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '아이디', value: user.id, inline: true },
          { name: '계정 생성', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        );
      if (member?.joinedTimestamp) {
        embed.addFields({ name: '서버 입장', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true });
        const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString());
        if (roles.length) embed.addFields({ name: `역할 (${roles.length})`, value: roles.slice(0, 15).join(' ') });
      }
      await interaction.reply({ embeds: [embed] });
    },
  },

  // ===== /아바타 =====
  {
    data: new SlashCommandBuilder()
      .setName('아바타')
      .setDescription('유저 프로필 사진을 크게 보여줘요')
      .addUserOption(o => o.setName('유저').setDescription('대상 (기본: 본인)')),
    async execute(interaction) {
      const user = interaction.options.getUser('유저') ?? interaction.user;
      const embed = new EmbedBuilder()
        .setTitle(`🖼️ ${user.username} 의 아바타`)
        .setColor(0x5865F2)
        .setImage(user.displayAvatarURL({ size: 512 }));
      await interaction.reply({ embeds: [embed] });
    },
  },

  // ===== /서버정보 =====
  {
    data: new SlashCommandBuilder()
      .setName('서버정보')
      .setDescription('이 서버의 정보를 보여줘요'),
    async execute(interaction) {
      const g = interaction.guild;
      const embed = new EmbedBuilder()
        .setTitle(`🏠 ${g.name}`)
        .setColor(0x5865F2)
        .setThumbnail(g.iconURL({ size: 256 }))
        .addFields(
          { name: '멤버 수', value: `${g.memberCount}명`, inline: true },
          { name: '채널 수', value: `${g.channels.cache.size}개`, inline: true },
          { name: '역할 수', value: `${g.roles.cache.size}개`, inline: true },
          { name: '서버 생성', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: true },
          { name: '부스트', value: `${g.premiumSubscriptionCount ?? 0}개 (레벨 ${g.premiumTier})`, inline: true },
        );
      await interaction.reply({ embeds: [embed] });
    },
  },
];
