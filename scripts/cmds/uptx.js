const os = require('os');
const { createCanvas, loadImage } = require('canvas');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const moment = require('moment-timezone');
const fs = require('fs');

module.exports = {
  config: {
    name: "uptx",
    aliases: ["uptime", "uxp"],
    version: "1.3",
    author: "XOS Ayan",
    role: 0,
    shortDescription: {
      en: "Check bot uptime with an image."
    },
    longDescription: {
      en: "Generates an image with uptime while other system stats are sent as text."
    },
    category: "system",
    guide: {
      en: "Type {pn} to check bot uptime."
    }
  },

  onStart: async function ({ message, usersData, threadsData }) {
    await module.exports.runUptime({ message, usersData, threadsData });
  },

  onChat: async function ({ event, message, usersData, threadsData }) {
    const body = event.body?.toLowerCase();
    const triggers = ["upt", "uptime", "uxp"];
    if (body && triggers.includes(body)) {
      await module.exports.runUptime({ message, usersData, threadsData });
    }
  },

  runUptime: async function ({ message, usersData, threadsData }) {
    try {
      const start = Date.now();

      const uptime = process.uptime();
      const s = Math.floor(uptime % 60);
      const m = Math.floor((uptime / 60) % 60);
      const h = Math.floor((uptime / 3600) % 24);
      const upTimeStr = `${h}h ${m}m ${s}s`;

      const cpuModel = os.cpus()[0].model;
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const diskUsage = await getDiskUsage();
      const processMemory = prettyBytes(process.memoryUsage().rss);
      const totalUsers = (await usersData.getAll()).length;
      const totalThreads = (await threadsData.getAll()).length;
      const currentTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:ss");

      const background = await loadImage("https://i.imgur.com/lshI9Rc.png");
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, 800, 400);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 45px Arial";
      ctx.textAlign = "left";
      ctx.fillText("BOT UPTIME", 30, 80);
      ctx.font = "bold 40px Arial";
      ctx.fillText(`${upTimeStr}`, 30, 140);

      const imagePath = `${__dirname}/uptime_image.png`;
      const buffer = canvas.toBuffer();
      fs.writeFileSync(imagePath, buffer);

      const ping = Date.now() - start;

      await message.reply({
        body: `•━━━━━━━━━━━━━━━━━•
> 🐥🎀 Bot Uptime : ${upTimeStr}
> 🎀 Date & Time : ${currentTime}
> 🎀 Total user : ${totalUsers}
> 🎀 Total group : ${totalThreads}
> 🎀 Disk : ${prettyBytes(diskUsage.used)} / ${prettyBytes(diskUsage.total)}
> 🎀 Ram : ${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)}
> 🎀 Cpu : ${cpuModel}
> 🎀 Ping : ${ping}ms
•━━━━━━━━━━━━━━━━━•
> Owner : 𝐒𝐚𝐤𝐢𝐛 
> Fb :  𝐓𝐚𝐧𝐣𝐢𝐫𝐨 𝐤𝐚𝐦𝐚𝐝𝐨
🎀 https://www.facebook.com/share/15jL93krv3/ `,
        attachment: fs.createReadStream(imagePath)
      });

      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error(err);
      await message.reply("❌ An error occurred while generating the uptime image.");
    }
  }
};

async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}