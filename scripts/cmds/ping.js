module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "1.0",
    author: "✨Sakib✨",
    role: 0,
    shortDescription: {
      en: "Displays the current ping of the bot's system."
    },
    longDescription: {
      en: "Displays the current ping of the bot's system."
    },
    category: "System",
    guide: {
      en: "Use {p}ping to check the current ping of the bot's system."
    }
  },
  onStart: async function ({ api, event, args }) {
    const timeStart = Date.now();
    await api.sendMessage(">🎀 𝐁𝐛𝐲 𝐜𝐡𝐞𝐚𝐤𝐢𝐧𝐠 𝐛𝐨𝐭 𝐩𝐢𝐧𝐠", event.threadID);
    const ping = Date.now() - timeStart;
    api.sendMessage(`>🎀 𝐁𝐛𝐲, 𝐓𝐡𝐞 𝐜𝐨𝐫𝐫𝐞𝐚𝐜𝐭 𝐩𝐢𝐧𝐠 𝐢𝐬 ${ping}ms.`, event.threadID);
  }
};