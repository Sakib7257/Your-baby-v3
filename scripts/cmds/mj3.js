const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "mj3",
    version: "3.1",
    role: 2,
    author: "Ariyan (Fixed)",
    countDown: 30,
    category: "AI"
  },

  onStart: async function ({ api, event, args, message }) {

    if (!global.GoatBot) global.GoatBot = {};
    if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();

    if (!args.length) return message.reply("⚠️ Please provide a prompt.");

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const prompt = args.join(" ");

      const res = await axios.post(
        "http://45.130.164.219:3000/generate",
        { prompt },
        {
          headers: { "x-api-key": "Maisha" },
          timeout: 120000
        }
      );

      if (!res.data?.success || !res.data.images || res.data.images.length < 4) {
        return message.reply("❌ Generation failed.");
      }

      const urls = res.data.images.slice(0, 4);

      const buffers = await Promise.all(
        urls.map(u =>
          axios.get(u, { responseType: "arraybuffer" })
            .then(r => Buffer.from(r.data))
        )
      );

      const meta = await sharp(buffers[0]).metadata();
      const w = meta.width;
      const h = meta.height;

      const grid = await sharp({
        create: {
          width: w * 2,
          height: h * 2,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([
          { input: buffers[0], left: 0, top: 0 },
          { input: buffers[1], left: w, top: 0 },
          { input: buffers[2], left: 0, top: h },
          { input: buffers[3], left: w, top: h }
        ])
        .png()
        .toBuffer();

      const file = path.join(__dirname, `mj_${Date.now()}.png`);
      fs.writeFileSync(file, grid);

      api.sendMessage(
        {
          body: "✨ MIDJOURNEY RESULT\nReply: U1 / U2 / U3 / U4",
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        (err, info) => {

          if (fs.existsSync(file)) fs.unlinkSync(file);

          if (info?.messageID) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "mj",
              senderID: event.senderID,
              urls // 🔥 buffer remove (RAM save)
            });
          }
        },
        event.messageID
      );

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);

      if (e.code === "ECONNABORTED") {
        return message.reply("⏱️ Request timeout.");
      }

      message.reply("❌ Generation failed.");
    }
  },

  onReply: async function ({ api, event, message }) {

    if (!event.messageReply) return;

    const rep = global.GoatBot.onReply.get(event.messageReply.messageID);
    if (!rep) return;

    if (rep.senderID !== event.senderID) return;

    const map = { U1: 0, U2: 1, U3: 2, U4: 3 };
    const cmd = event.body.trim().toUpperCase();

    if (!(cmd in map)) return;

    try {
      api.setMessageReaction("✨", event.messageID, () => {}, true);

      const idx = map[cmd];
      const url = rep.urls[idx];

      const img = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(img.data);

      const meta = await sharp(buffer).metadata();

      const upscaled = await sharp(buffer)
        .resize(meta.width * 2, meta.height * 2, {
          kernel: sharp.kernel.lanczos3
        })
        .png()
        .toBuffer();

      const file = path.join(__dirname, `up_${Date.now()}.png`);
      fs.writeFileSync(file, upscaled);

      api.sendMessage(
        {
          body: `🖼️ Upscaled U${idx + 1}`,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        },
        event.messageID
      );

    } catch (e) {
      message.reply("❌ Upscale failed.");
    }
  }
};