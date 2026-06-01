const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDb } = require('../lib/firestore');

function todayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()); // YYYY-MM-DD
}
function yesterdayStr() {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);
}

module.exports = [
  {
    data: new SlashCommandBuilder().setName('출석').setDescription('오늘 출석을 체크해요'),
    async execute(interaction) {
      const db = getDb();
      const ref = db.collection('guilds').doc(interaction.guildId)
        .collection('attendance').doc(interaction.user.id);
      const snap = await ref.get();
      const today = todayStr();
      const data = snap.exists ? snap.data() : { streak: 0, total: 0, lastDate: null };

      if (data.lastDate === today) {
        return interaction.reply({ content: '✅ 오늘은 이미 출석했어요!', ephemeral: true });
      }
      const streak = data.lastDate === yesterdayStr() ? data.streak + 1 : 1;
      const total = (data.total ?? 0) + 1;
      await ref.set({ streak, total, lastDate: today, userTag: interaction.user.tag }, { merge: true });

      const embed = new EmbedBuilder()
        .setTitle('📅 출석 완료!')
        .setColor(0x57F287)
        .setDescription(`**${interaction.user.username}** 님 출석!\n🔥 연속 출석: **${streak}일**\n📊 누적 출석: **${total}일**`);
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    data: new SlashCommandBuilder().setName('출석순위').setDescription('서버 출석 랭킹 TOP 10'),
    async execute(interaction) {
      const db = getDb();
      const snap = await db.collection('guilds').doc(interaction.guildId)
        .collection('attendance').orderBy('total', 'desc').limit(10).get();
      if (snap.empty) return interaction.reply({ content: '아직 출석 기록이 없어요.', ephemeral: true });
      const medals = ['🥇','🥈','🥉'];
      const lines = snap.docs.map((d, i) => {
        const w = d.data();
        return `${medals[i] ?? `${i + 1}.`} ${w.userTag ?? '알 수 없음'} — ${w.total}일 (연속 ${w.streak})`;
      });
      const embed = new EmbedBuilder().setTitle('🏆 출석 랭킹').setColor(0xFEE75C).setDescription(lines.join('\n'));
      await interaction.reply({ embeds: [embed] });
    },
  },
];
