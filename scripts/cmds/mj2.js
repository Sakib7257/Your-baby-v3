const axios = require('axios');
const Jimp = require('jimp');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: "mj2",
        version: "3.0",
        role: 0,
        author: "Upol Zox x Tanjiro (FIXED)",
        description: "MJ Turbo with Working Upscale",
        category: "AI",
        guide: "{pn} <prompt>"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID } = event;

        if (!global.client) global.client = {};
        if (!global.client.mj2Store) global.client.mj2Store = {};

        const prompt = args.join(" ");
        if (!prompt) {
            return api.sendMessage("⚠️ Please provide a prompt.", threadID, messageID);
        }

        try {
            api.setMessageReaction("🔍", messageID, () => {}, true);

            const res = await axios.get("https://upoldzox-portal.onrender.com/mj-turbo", {
                params: { prompt }
            });

            if (!res.data || !Array.isArray(res.data.images) || res.data.images.length < 4) {
                throw new Error("Image generation failed.");
            }

            const imageUrls = res.data.images;

            const cacheDir = __dirname + "/cache";
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            const gridPath = `${cacheDir}/mj_${messageID}.jpg`;

            const images = await Promise.all(imageUrls.map(url => Jimp.read(url)));

            const w = images[0].bitmap.width;
            const h = images[0].bitmap.height;

            const grid = new Jimp(w * 2, h * 2);

            grid
                .composite(images[0], 0, 0)
                .composite(images[1], w, 0)
                .composite(images[2], 0, h)
                .composite(images[3], w, h);

            await grid.writeAsync(gridPath);

            // 🔥 SAVE USER DATA (IMPORTANT FIX)
            global.client.mj2Store[senderID] = {
                images: imageUrls,
                time: Date.now()
            };

            api.sendMessage({
                body: "🖼️ Type U1, U2, U3, or U4 to select image.",
                attachment: fs.createReadStream(gridPath)
            }, threadID, () => {
                fs.unlinkSync(gridPath);
            }, messageID);

            api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (err) {
            console.error(err);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("❌ Error: " + err.message, threadID, messageID);
        }
    },

    onChat: async function ({ api, event }) {
        const { threadID, messageID, body, senderID } = event;

        if (!body) return;

        const data = global.client.mj2Store?.[senderID];
        if (!data) return;

        // ⏳ expire after 2 min
        if (Date.now() - data.time > 120000) {
            delete global.client.mj2Store[senderID];
            return;
        }

        const match = body.trim().toUpperCase().match(/^U\s*([1-4])$/);
        if (!match) return;

        const index = parseInt(match[1]) - 1;
        const imgUrl = data.images[index];

        if (!imgUrl) {
            return api.sendMessage("❌ Invalid choice.", threadID, messageID);
        }

        try {
            api.setMessageReaction("✨", messageID, () => {}, true);

            const path = __dirname + `/cache/up_${messageID}.jpg`;

            const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(path, Buffer.from(img.data));

            api.sendMessage({
                body: `✅ Here is U${index + 1}`,
                attachment: fs.createReadStream(path)
            }, threadID, () => {
                fs.unlinkSync(path);
            }, messageID);

        } catch (err) {
            console.error(err);
            api.sendMessage("❌ Failed to fetch image.", threadID, messageID);
        }
    }
};