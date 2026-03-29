 const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "mj3",
    version: "1.0",
    role: 2,
    author: "MJ3 FINAL",
    countDown: 20,
    category: "AI"
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args.length) return message.reply("Provide a prompt.");

    if (!global.mj3Store) global.mj3Store = {};

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const prompt = args.join(" ");

      const res = await axios.get(
        "https://midjourney-api-production-21ca.up.railway.app/mj",
        { params: { prompt }, timeout: 120000 }
      );

      if (!res.data?.success || !res.data?.images?.length)
        return message.reply("Generation failed.");

      const buffers = await Promise.all(
        res.data.images.slice(0, 4).map(async (url) => {
          try {
            const r = await axios.get(url, { responseType: "arraybuffer" });
            return Buffer.from(r.data);
          } catch {
            return null;
          }
        })
      );

      if (buffers.some(b => !b)) return message.reply("Download failed.");

      const squares = await Promise.all(
        buffers.map(async (b) => {
          const meta = await sharp(b).metadata();
          const size = Math.min(meta.width, meta.height);
          const left = Math.floor((meta.width - size) / 2);
          const top = Math.floor((meta.height - size) / 2);

          return sharp(b)
            .extract({ left, top, width: size, height: size })
            .resize(512, 512)
            .toBuffer();
        })
      );

      const grid = await sharp({
        create: {
          width: 1024,
          height: 1024,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([
          { input: squares[0], left: 0, top: 0 },
          { input: squares[1], left: 512, top: 0 },
          { input: squares[2], left: 0, top: 512 },
          { input: squares[3], left: 512, top: 512 }
        ])
        .png()
        .toBuffer();

      const file = path.join(__dirname, `mj3_${Date.now()}.png`);
      fs.writeFileSync(file, grid);

      // 🔥 SAVE USER DATA
      global.mj3Store[event.senderID] = {
        squares,
        time: Date.now()
      };

      api.sendMessage(
        {
          body: "🔥 MJ3 Generated\nType: U1 / U2 / U3 / U4",
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file),
        event.messageID
      );

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (e) {
      console.log(e);
      message.reply("Error");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onChat: async function ({ api, event }) {
    if (!event.body) return;

    const data = global.mj3Store?.[event.senderID];
    if (!data) return;

    // ⏳ expire 2 min
    if (Date.now() - data.time > 120000) {
      delete global.mj3Store[event.senderID];
      return;
    }

    const match = event.body.trim().toUpperCase().match(/^U([1-4])$/);
    if (!match) return;

    const index = Number(match[1]) - 1;

    try {
      api.setMessageReaction("✨", event.messageID, () => {}, true);

      const img = data.squares[index];

      const upscaled = await sharp(img)
        .resize(1024, 1024)
        .png()
        .toBuffer();

      const file = path.join(__dirname, `up_${Date.now()}.png`);
      fs.writeFileSync(file, upscaled);

      api.sendMessage(
        {
          body: `🔥 U${index + 1}`,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file),
        event.messageID
      );

    } catch (e) {
      console.log(e);
      api.sendMessage("Upscale failed", event.threadID, event.messageID);
    }
  }
};