const os = require('os');
const chalk = require("chalk");

const bold = chalk.bold;
const thin = chalk.dim;

module.exports = {
  config: {
    name: 'stats',
    aliases: ['rtm', 'system'],
    version: '1.0',
    author: 'BaYjid',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot system stats',
    longDescription: 'Display bot system stats',
    category: 'system',
    guide: '{pn}: Display bot system stats'
  },
  onStart: async function ({ message, event, usersData, threadsData, api }) {
    const startTime = Date.now();
    const users = await usersData.getAll();
    const groups = await threadsData.getAll();
    const uptime = process.uptime();
    const sentMessage = await message.reply(thin("🔄 loading…"));

    try {
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

      const cpuCores = os.cpus().length;
      const cpuModel = os.cpus()[0].model;
      const nodeVersion = process.version;
      const platform = os.platform();

      const endTime = Date.now();
      const botPing = endTime - startTime;
      const apiPing = sentMessage.timestamp - startTime;

      const messageContent = `🖥 ${bold("System Statistics")}:\n\n` +
        `• Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
        `• Total Memory: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n` +
        `• Free Memory: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n` +
        `• Memory Usage: ${memoryUsagePercentage}%\n` +
        `• CPU Cores: ${cpuCores}\n` +
        `• CPU Model: ${cpuModel}\n` +
        `• Node.js Version: ${nodeVersion}\n` +
        `• Platform: ${platform}\n` +
        `• Ping: ${botPing}ms\n• API: ${apiPing}ms\n• Total Users: ${users.length}\n• Total Groups: ${groups.length}`;

      return api.editMessage(thin(messageContent), sentMessage.messageID);
    } catch (err) {
      console.error(err);
      return api.editMessage("❌ An error occurred while fetching system statistics.", sentMessage.messageID);
    }
  }
};