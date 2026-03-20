const axios = require('axios');
const Jimp = require('jimp');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: "mj",
        version: "4.0",
        role: 0,
        author: "UPoL Zox + FINAL FIX",
        description: "Midjourney Image Generator + Upscale",
        category: "AI",
        guide: "{pn} prompt --ar 16:9 --m Midjourney_Niji_6 --ref <url>"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, type, messageReply, senderID } = event;

        if (!global.client) global.client = {};
        if (!global.client.mjStore) global.client.mjStore = {};

        let prompt = args.join(" ");
        if (!prompt) {
            return api.sendMessage("⚠️ Please provide a prompt.", threadID, messageID);
        }

        let imageUrl = "";

        // 🔹 Reference image
        const refMatch = prompt.match(/--ref\s+(\S+)/);
        if (refMatch) {
            imageUrl = refMatch[1];
            prompt = prompt.replace(refMatch[0], "").trim();
        } else if (type === "message_reply" && messageReply?.attachments?.length > 0) {
            const at = messageReply.attachments[0];
            if (at.type === "photo") imageUrl = at.url;
        }

        // 🔹 Ratio
        const arMatch = prompt.match(/--ar\s+(\d+:\d+)/);
        const ratio = arMatch ? arMatch[1] : "1:1";
        if (arMatch) prompt = prompt.replace(arMatch[0], "").trim();

        // 🔹 Model
        const mMatch = prompt.match(/--m\s+(\S+)/);
        const model = mMatch ? mMatch[1] : "Midjourney_Niji_6";
        if (mMatch) prompt = prompt.replace(mMatch[0], "").trim();

        try {
            api.setMessageReaction("🔍", messageID, () => {}, true);

            const res = await axios.get(`https://upolzox-port.onrender.com/mj`, {
                params: { prompt, model, ratio, imageUrl }
            });

            if (!res.data.success || !res.data.images || res.data.images.length < 4) {
                throw new Error("Image generation failed.");
            }

            // 🔥 Flexible image field
            const imageUrls = res.data.images.map(img =>
                img.final || img.url || img.image || img
            );

            const cacheDir = __dirname + "/cache";
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const pathGrid = `${cacheDir}/mj_${messageID}.png`;

            const images = await Promise.all(imageUrls.map(url => Jimp.read(url)));

            const w = images[0].bitmap.width;
            const h = images[0].bitmap.height;

            const grid = new Jimp(w * 2, h * 2);

            grid
                .composite(images[0], 0, 0)
                .composite(images[1], w, 0)
                .composite(images[2], 0, h)
                .composite(images[3], w, h);

            await grid.writeAsync(pathGrid);

            // 🔥 Save for upscale (USER BASED)
            global.client.mjStore[senderID] = {
                images: imageUrls,
                time: Date.now()
            };

            api.sendMessage({
                body: "✨ Reply with U1, U2, U3, or U4 to upscale image.",
                attachment: fs.createReadStream(pathGrid)
            }, threadID, () => {
                fs.unlinkSync(pathGrid);
            }, messageID);

            api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (e) {
            console.error("GEN ERROR:", e);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("❌ Error: " + e.message, threadID, messageID);
        }
    },

    onChat: async function ({ api, event }) {
        const { threadID, messageID, body, senderID } = event;

        if (!body) return;

        const data = global.client.mjStore?.[senderID];
        if (!data) return;

        // ⏳ expire after 2 min
        if (Date.now() - data.time > 120000) {
            delete global.client.mjStore[senderID];
            return;
        }

        const match = body.trim().toUpperCase().match(/^U\s*([1-4])$/);
        if (!match) return;

        const index = Number(match[1]) - 1;
        const imgUrl = data.images[index];

        if (!imgUrl) {
            return api.sendMessage("⚠️ Invalid selection.", threadID, messageID);
        }

        try {
            api.setMessageReaction("✨", messageID, () => {}, true);

            const path = __dirname + `/cache/up_${messageID}.png`;

            const imgRes = await axios.get(imgUrl, {
                responseType: "arraybuffer"
            });

            fs.writeFileSync(path, Buffer.from(imgRes.data));

            api.sendMessage({
                body: `✅ Upscaled Image U${index + 1}`,
                attachment: fs.createReadStream(path)
            }, threadID, () => {
                fs.unlinkSync(path);
            }, messageID);

        } catch (e) {
            console.error("UPSCALE ERROR:", e);
            api.sendMessage("❌ Upscale failed: " + e.message, threadID, messageID);
        }
    }
};