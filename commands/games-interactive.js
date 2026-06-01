const {
  SlashCommandBuilder, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} = require('discord.js');

module.exports = [
  // ===== /경마 =====
  {
    data: new SlashCommandBuilder()
      .setName('경마')
      .setDescription('이모지 말 경주를 봐요'),
    async execute(interaction) {
      const horses = ['🐎', '🦄', '🐴', '🐕'];
      const track = 20;
      const pos = horses.map(() => 0);

      const render = () => horses.map((h, i) =>
        `${'─'.repeat(pos[i])}${h}${'─'.repeat(Math.max(0, track - pos[i]))}🏁`
      ).join('\n');

      const msg = await interaction.reply({
        embeds: [new EmbedBuilder().setTitle('🏇 경마 시작!').setColor(0x8B4513).setDescription('```\n' + render() + '\n```')],
        fetchReply: true,
      });

      let winner = -1;
      const timer = setInterval(async () => {
        for (let i = 0; i < horses.length; i++) {
          pos[i] += Math.floor(Math.random() * 3);
          if (pos[i] >= track && winner === -1) winner = i;
        }
        const done = winner !== -1;
        await msg.edit({
          embeds: [new EmbedBuilder()
            .setTitle(done ? '🏆 경주 종료!' : '🏇 경주 중...')
            .setColor(0x8B4513)
            .setDescription('```\n' + render() + '\n```' + (done ? `\n\n우승: ${horses[winner]} (${winner + 1}번)` : ''))],
        }).catch(() => {});
        if (done) clearInterval(timer);
      }, 1200);
    },
  },

  // ===== /숫자야구 =====
  {
    data: new SlashCommandBuilder()
      .setName('숫자야구')
      .setDescription('3자리 숫자야구 (서로 다른 숫자, 60초)'),
    async execute(interaction) {
      // 서로 다른 3자리 숫자 생성
      const digits = [];
      while (digits.length < 3) {
        const d = Math.floor(Math.random() * 10);
        if (!digits.includes(d)) digits.push(d);
      }
      const answer = digits.join('');

      await interaction.reply('⚾ 숫자야구 시작! 서로 다른 3자리 숫자를 채팅으로 입력하세요. (60초)');

      const filter = m => /^\d{3}$/.test(m.content) && new Set(m.content).size === 3;
      const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

      collector.on('collect', m => {
        let strike = 0, ball = 0;
        for (let i = 0; i < 3; i++) {
          if (m.content[i] === answer[i]) strike++;
          else if (answer.includes(m.content[i])) ball++;
        }
        if (strike === 3) {
          m.reply(`🎉 정답! **${answer}** — ${m.author} 승리!`);
          collector.stop('win');
        } else {
          m.reply(`${strike}S ${ball}B`);
        }
      });

      collector.on('end', (_c, reason) => {
        if (reason !== 'win') interaction.channel.send(`⏱️ 시간 종료! 정답은 **${answer}** 였어요.`);
      });
    },
  },

  // ===== /반응속도 =====
  {
    data: new SlashCommandBuilder()
      .setName('반응속도')
      .setDescription('초록 버튼이 뜨면 가장 빨리 누르세요'),
    async execute(interaction) {
      const wait = 2000 + Math.floor(Math.random() * 4000);
      const redRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('rt').setLabel('대기...').setStyle(ButtonStyle.Danger).setDisabled(true));

      await interaction.reply({ content: '🔴 초록색이 되면 누르세요!', components: [redRow] });

      setTimeout(async () => {
        const greenRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('rt').setLabel('지금!').setStyle(ButtonStyle.Success));
        const start = Date.now();
        await interaction.editReply({ content: '🟢 눌러!', components: [greenRow] });

        const msg = await interaction.fetchReply();
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 5000, max: 1 });
        collector.on('collect', async i => {
          const ms = Date.now() - start;
          await i.update({ content: `⚡ ${i.user} — **${ms}ms**!`, components: [] });
        });
        collector.on('end', c => {
          if (c.size === 0) interaction.editReply({ content: '⌛ 아무도 안 눌렀어요.', components: [] }).catch(() => {});
        });
      }, wait);
    },
  },

  // ===== /투표 =====
  {
    data: new SlashCommandBuilder()
      .setName('투표')
      .setDescription('간단 찬반/객관식 투표를 만들어요')
      .addStringOption(o => o.setName('주제').setDescription('투표 주제').setRequired(true))
      .addStringOption(o => o.setName('항목').setDescription('쉼표로 구분 (없으면 👍/👎)')),
    async execute(interaction) {
      const topic = interaction.options.getString('주제');
      const raw = interaction.options.getString('항목');
      const embed = new EmbedBuilder().setTitle('🗳️ ' + topic).setColor(0x5865F2);

      if (!raw) {
        embed.setDescription('👍 찬성 / 👎 반대');
        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
        await msg.react('👍'); await msg.react('👎');
        return;
      }
      const opts = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10);
      const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      embed.setDescription(opts.map((o, i) => `${emojis[i]} ${o}`).join('\n'));
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      for (let i = 0; i < opts.length; i++) await msg.react(emojis[i]);
    },
  },
];
