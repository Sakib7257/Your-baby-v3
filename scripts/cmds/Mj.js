const axios = require('axios');
const Jimp = require('jimp');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: "Mj",
        version: "2.0",
        role: 0,
        author: "UPoL Zox (Fixed)",
        description: "Midjourney Image Generator with Upscale (U1-U4)",
        category: "AI",
        guide: "{pn} prompt --ar 16:9 --m Midjourney_Niji_6 --ref <url>"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, type, messageReply } = event;

        if (!global.client) global.client = {};
        if (!global.client.onReply) global.client.onReply = new Map();

        let prompt = args.join(" ");
        if (!prompt) return api.sendMessage("⚠️ Please provide a prompt.", threadID, messageID);

        let imageUrl = "";

        // 🔹 Reference Image
        const refMatch = prompt.match(/--ref\s+(\S+)/);
        if (refMatch) {
            imageUrl = refMatch[1];
            prompt = prompt.replace(refMatch[0], "").trim();
        } else if (type === "message_reply" && messageReply.attachments?.length > 0) {
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

            if (!res.data.success || !res.data.images || res.data.images.length < 4)
                throw new Error("Image generation failed.");

            const imageUrls = res.data.images.map(img => img.final);

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

            api.sendMessage({
                body: "✨ Reply with U1, U2, U3, or U4 to upscale image.",
                attachment: fs.createReadStream(pathGrid)
            }, threadID, (err, info) => {

                api.setMessageReaction("✅", messageID, () => {}, true);

                if (fs.existsSync(pathGrid)) fs.unlinkSync(pathGrid);

                if (!err) {
                    global.client.onReply.set(info.messageID, {
                        commandName: "mj",
                        images: imageUrls,
                        author: event.senderID
                    });
                }

            }, messageID);

        } catch (e) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("❌ Error: " + e.message, threadID, messageID);
        }
    },

    onReply: async function ({ api, event }) {
        const { threadID, messageID, body, messageReply, senderID } = event;

        if (!messageReply) return;

        const data = global.client.onReply.get(messageReply.messageID);
        if (!data) return;

        // 🔒 Only original user can upscale
        if (senderID !== data.author) return;

        const match = body.trim().toUpperCase().match(/^U([1-4])$/);
        if (!match) return;

        const index = Number(match[1]) - 1;

        if (!data.images[index]) {
            return api.sendMessage("⚠️ Invalid selection.", threadID, messageID);
        }

        try {
            api.setMessageReaction("✨", messageID, () => {}, true);

            const imgUrl = data.images[index];
            const path = __dirname + `/cache/up_${messageID}.png`;

            const imgRes = await axios.get(imgUrl, {
                responseType: "arraybuffer"
            });

            fs.writeFileSync(path, Buffer.from(imgRes.data));

            api.sendMessage({
                body: `✅ Upscaled Image U${index + 1}`,
                attachment: fs.createReadStream(path)
            }, threadID, () => {
                if (fs.existsSync(path)) fs.unlinkSync(path);
            }, messageID);

        } catch (e) {
            api.sendMessage("❌ Upscale failed.", threadID, messageID);
        }
    }
};