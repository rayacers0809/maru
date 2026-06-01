require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const mod = require(path.join(commandsPath, file));
  const list = Array.isArray(mod) ? mod : [mod];
  for (const command of list) {
    if (command && 'data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`⏳ ${commands.length}개 명령어 등록 중...`);
    // 길드 단위 등록 = 즉시 반영 (글로벌은 최대 1시간 걸림)
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log(`✅ ${data.length}개 명령어 등록 완료!`);
    data.forEach(c => console.log(`   /${c.name}`));
  } catch (error) {
    console.error(error);
  }
})();
