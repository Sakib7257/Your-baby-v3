const axios = require('axios');
const Jimp = require('jimp');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: "mj2",
        version: "2.1",
        role: 0,
        author: "Upol Zox x Tanjiro",
        description: "Generate images using MJ Turbo API",
        category: "AI",
        guide: "{pn} <prompt>"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;

        // ✅ Ensure global reply map
        if (!global.client) global.client = {};
        if (!global.client.onReply) global.client.onReply = new Map();

        const prompt = args.join(" ");
        if (!prompt) {
            return api.sendMessage("⚠️ Please provide a prompt.", threadID, messageID);
        }

        try {
            api.setMessageReaction("🔍", messageID, () => {}, true);

            // 🔥 API CALL
            const res = await axios.get("https://upoldzox-portal.onrender.com/mj-turbo", {
                params: { prompt }
            });

            if (!res.data || !Array.isArray(res.data.images) || res.data.images.length < 4) {
                throw new Error("Image generation failed.");
            }

            const imageUrls = res.data.images;

            // 📁 Cache folder
            const cacheDir = __dirname + "/cache";
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            const gridPath = `${cacheDir}/mj_${messageID}.jpg`;

            // 🖼️ Load images safely
            const images = await Promise.all(
                imageUrls.map(async (url) => {
                    try {
                        return await Jimp.read(url);
                    } catch {
                        throw new Error("Failed to load one of the images.");
                    }
                })
            );

            const w = images[0].bitmap.width;
            const h = images[0].bitmap.height;

            const grid = new Jimp(w * 2, h * 2);

            grid
                .composite(images[0], 0, 0)
                .composite(images[1], w, 0)
                .composite(images[2], 0, h)
                .composite(images[3], w, h);

            await grid.quality(90).writeAsync(gridPath);

            // 📤 Send result
            api.sendMessage({
                body: "🖼️ Reply with U1, U2, U3, or U4 to select image.\n\n👤 Author: Upol Zox x Tanjiro",
                attachment: fs.createReadStream(gridPath)
            }, threadID, (err, info) => {

                api.setMessageReaction("✅", messageID, () => {}, true);

                // 🧹 Clean grid file
                if (fs.existsSync(gridPath)) fs.unlinkSync(gridPath);

                if (!err && info) {
                    global.client.onReply.set(info.messageID, {
                        commandName: "mj",
                        images: imageUrls,
                        author: event.senderID
                    });
                }
            }, messageID);

        } catch (err) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("❌ Error: " + err.message, threadID, messageID);
        }
    },

    onReply: async function ({ api, event }) {
        const { threadID, messageID, body, messageReply, senderID } = event;

        if (!messageReply) return;

        const data = global.client.onReply.get(messageReply.messageID);
        if (!data || data.commandName !== "mj") return;

        // 🔒 Optional: Only original user can reply
        if (data.author && data.author !== senderID) {
            return api.sendMessage("⚠️ Only command user can select image.", threadID, messageID);
        }

        const match = body.trim().toUpperCase().match(/^U([1-4])$/);
        if (!match) return;

        const index = parseInt(match[1]) - 1;

        if (!data.images[index]) {
            return api.sendMessage("❌ Invalid choice.", threadID, messageID);
        }

        try {
            api.setMessageReaction("✨", messageID, () => {}, true);

            const imgUrl = data.images[index];
            const path = __dirname + `/cache/up_${messageID}.jpg`;

            // 📥 Download selected image
            const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(path, Buffer.from(img.data));

            api.sendMessage({
                body: `✅ Here is U${index + 1}\n\n👤 Author: Upol Zox x Tanjiro`,
                attachment: fs.createReadStream(path)
            }, threadID, () => {
                if (fs.existsSync(path)) fs.unlinkSync(path);
            }, messageID);

        } catch (err) {
            api.sendMessage("❌ Failed to fetch image.", threadID, messageID);
        }
    }
};