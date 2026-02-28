const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "✨Sakib✨",
    countDown: 5,
    role: 0,
    category: "info",
    guide: {
      en: "{pn} / help <command name>",
    },
    priority: 1,
  },

  onStart: async function ({ message, args }) {
    await this.sendHelp(message, args);
  },

  onChat: async function ({ event, message }) {
    if (event.body.toLowerCase().startsWith("help")) {
      const args = event.body.split(" ").slice(1);
      await this.sendHelp(message, args);
    }
  },

  sendHelp: async function (message, args) {
    if (args.length === 0) {
      const categories = {};
      let msg = "╭──── ✦ 𝐄𝐑𝐄𝐍 ✦ ────╮";

      for (const [name, value] of commands) {
        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        msg += `\n\n╭── ✿ ${category.toUpperCase()} ✿ ──╮`;

        const names = categories[category].commands.sort();
        for (let i = 0; i < names.length; i += 2) {
          const cmds = names.slice(i, i + 2).map((item) => `• ${item}`);
          msg += `\n│ ${cmds.join("      ")}`;
        }

        msg += `\n╰──────────────╯`;
      });

      const totalCommands = commands.size;
      msg += `\n\n📌 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${totalCommands}`;
      msg += `\n\n 𝐗𝐨𝐬 𝐓𝐚𝐧𝐣𝐢𝐫𝐨 `;

      const helpListImages = ["https://drive.google.com/uc?id=1NSDk4wv7kIF9qIB9Z8e-satx1bcBvMio"];
      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      return message.reply({
        body: msg
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ 𝑶𝒐𝒑𝒔! "${commandName}" Not Found `);
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";
      const longDescription = configCommand.longDescription?.en || "No description available";
      const usage = configCommand.guide?.en.replace(/{pn}/g, commandName) || "Usage info nai baby~";

      const response = `
╭───    𝗖𝗢𝗠𝗠𝗔𝗡𝗗    ───╮
• 📌 𝗡𝗮𝗺𝗲: ${configCommand.name}
• 📝 𝗗𝗲𝘀𝗰: ${longDescription}
• 🆔 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${configCommand.aliases || "None"}
• 🔖 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${configCommand.version || "1.0"}
• 👤 𝗥𝗼𝗹𝗲: ${roleText}
• ⏳ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${configCommand.countDown || 0} sec
• 👨‍💻 𝗔𝘂𝘁𝗵𝗼𝗿: ${author}
• 📖 𝗨𝘀𝗮𝗴𝗲: ${usage}
╰──────────────────╯
`;
      return message.reply(response);
    }
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "🌍 All Users";
    case 1: return "👑 Group Admins";
    case 2: return "🤖 Bot Admin Only";
    default: return "❓ Unknown Role";
  }
}