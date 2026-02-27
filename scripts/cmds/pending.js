module.exports = {
        config: {
                name: "pending",
                aliases: ["pen", "approve", "পেন্ডিং"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 2,
                description: {
                        bn: "বটের পেন্ডিং গ্রুপগুলো দেখুন এবং অ্যাপ্রুভ করুন (অ্যাডমিন)",
                        en: "View and approve pending group requests for the bot (Admin)",
                        vi: "Xem và phê duyệt các yêu cầu nhóm đang chờ xử lý cho bot (Quản trị viên)"
                },
                category: "utility",
                guide: {
                        bn: '   {pn}: পেন্ডিং লিস্ট দেখতে ব্যবহার করুন। তারপর ইনডেক্স নম্বর দিয়ে রিপ্লাই দিন।',
                        en: '   {pn}: Use to see pending list. Then reply with the index number.',
                        vi: '   {pn}: Sử dụng để xem danh sách chờ. Sau đó trả lời bằng số thứ tự.'
                }
        },

        langs: {
                bn: {
                        noPending: "× কোনো গ্রুপ পেন্ডিং কিউতে নেই! 😴",
                        listHeader: "📋 মোট পেন্ডিং গ্রুপ: %1টি\n",
                        replyGuide: "\n• অ্যাপ্রুভ করতে ইনডেক্স নম্বর দিয়ে রিপ্লাই দিন (উদা: 1 2 3)",
                        successNotify: "বট এখন কানেক্টেড! কমান্ড দেখতে !help ব্যবহার করুন। ✨",
                        approvedBy: "এই গ্রুপটি %1 দ্বারা অ্যাপ্রুভ করা হয়েছে।",
                        done: "✅ সফলভাবে %1টি গ্রুপ অ্যাপ্রুভ করা হয়েছে।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noPending: "× No groups in pending queue! 😴",
                        listHeader: "📋 Total Pending: %1\n",
                        replyGuide: "\n• Reply with index number to approve (Ex: 1 2 3)",
                        successNotify: "Bot is now connected! Use !help to see commands. ✨",
                        approvedBy: "This group was approved by %1.",
                        done: "✅ Successfully approved %1 group(s).",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noPending: "× Không có nhóm nào trong hàng đợi chờ xử lý! 😴",
                        listHeader: "📋 Tổng số chờ xử lý: %1\n",
                        replyGuide: "\n• Trả lời bằng số thứ tự để phê duyệt (VD: 1 2 3)",
                        successNotify: "Bot hiện đã được kết nối! Sử dụng !help để xem các lệnh. ✨",
                        approvedBy: "Nhóm này đã được phê duyệt bởi %1.",
                        done: "✅ Đã phê duyệt thành công %1 nhóm.",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onReply: async function ({ api, event, Reply, usersData, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) return;

                const { author, pending } = Reply;
                if (String(event.senderID) !== String(author)) return;

                const index = event.body.split(/\s+/);
                let count = 0;

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        const name = await usersData.getName(event.senderID);

                        for (const i of index) {
                                if (isNaN(i) || i <= 0 || i > pending.length) continue;

                                const target = pending[i - 1];
                                await api.sendMessage(getLang("successNotify"), target.threadID);
                                await api.sendMessage(getLang("approvedBy", name), target.threadID);
                                count++;
                        }

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("done", count), event.threadID, event.messageID);

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
                }
        },

        onStart: async function ({ api, event, getLang, message }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) return;

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
                        const pend = await api.getThreadList(100, null, ["PENDING"]) || [];
                        const list = [...spam, ...pend].filter(g => g.isSubscribed && g.isGroup);

                        if (list.length === 0) {
                                api.setMessageReaction("🥺", event.messageID, () => {}, true);
                                return message.reply(getLang("noPending"));
                        }

                        let msg = getLang("listHeader", list.length);
                        list.forEach((g, i) => msg += `${i + 1}. ${g.name || "Unknown Group"} (${g.threadID})\n`);
                        msg += getLang("replyGuide");

                        return message.reply(msg, (err, info) => {
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: this.config.name,
                                        author: event.senderID,
                                        pending: list
                                });
                        });

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
