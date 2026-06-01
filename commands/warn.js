const {
  SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits,
} = require('discord.js');
const { getDb } = require('../lib/firestore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('경고')
    .setDescription('경고를 부여/조회/삭제해요')
    .addSubcommand(s => s.setName('부여').setDescription('경고를 줘요')
      .addUserOption(o => o.setName('유저').setDescription('대상').setRequired(true))
      .addStringOption(o => o.setName('사유').setDescription('사유').setRequired(true)))
    .addSubcommand(s => s.setName('조회').setDescription('경고 목록을 봐요')
      .addUserOption(o => o.setName('유저').setDescription('대상').setRequired(true)))
    .addSubcommand(s => s.setName('삭제').setDescription('경고를 전부 지워요')
      .addUserOption(o => o.setName('유저').setDescription('대상').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('유저');
    const db = getDb();
    const col = db.collection('guilds').doc(interaction.guildId)
      .collection('warns');

    if (sub === '부여') {
      const reason = interaction.options.getString('사유');
      await col.add({
        userId: user.id,
        userTag: user.tag,
        reason,
        moderatorId: interaction.user.id,
        createdAt: Date.now(),
      });
      const count = (await col.where('userId', '==', user.id).get()).size;
      const embed = new EmbedBuilder()
        .setTitle('⚠️ 경고 부여')
        .setColor(0xFEE75C)
        .setDescription(`**${user.tag}** 에게 경고를 줬어요.\n사유: ${reason}\n누적 경고: **${count}회**`);
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === '조회') {
      const snap = await col.where('userId', '==', user.id).get();
      if (snap.empty) return interaction.reply({ content: `**${user.tag}** 는 경고가 없어요.`, ephemeral: true });
      const lines = snap.docs
        .map(d => d.data())
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((w, i) => `${i + 1}. ${w.reason} \`<t:${Math.floor(w.createdAt / 1000)}:d>\``);
      const embed = new EmbedBuilder()
        .setTitle(`⚠️ ${user.tag} 경고 목록 (${snap.size}회)`)
        .setColor(0xFEE75C)
        .setDescription(lines.join('\n'));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === '삭제') {
      const snap = await col.where('userId', '==', user.id).get();
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      return interaction.reply(`🗑️ **${user.tag}** 의 경고 ${snap.size}건을 모두 삭제했어요.`);
    }
  },
};
