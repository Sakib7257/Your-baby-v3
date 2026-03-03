module.exports = {
        config: {
                name: "balance",
                aliases: ["bal", "টাকা"],
<<<<<<< HEAD
                version: "1.7",
=======
<<<<<<< HEAD
                version: "1.7",
=======
                version: "1.9",
>>>>>>> 5ad45cf (ok)
>>>>>>> e4b7481 (Initial commit)
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
<<<<<<< HEAD
                        bn: "আপনার বা ট্যাগ করা ইউজারের ব্যালেন্স দেখুন (Short Form)",
=======
<<<<<<< HEAD
                        bn: "আপনার বা ট্যাগ করা ইউজারের ব্যালেন্স দেখুন (Short Form)",
=======
                        bn: "আপনার বা ট্যাগ করা ইউজারের ব্যালেন্স দেখুন",
>>>>>>> 5ad45cf (ok)
>>>>>>> e4b7481 (Initial commit)
                        en: "View your money or tagged person money in formatted style",
                        vi: "Xem số tiền của bạn hoặc người được tag (định dạng ngắn)"
                },
                category: "economy",
                guide: {
<<<<<<< HEAD
                        bn: '   {pn}: নিজের ব্যালেন্স দেখতে\n   {pn} @tag: কারো ব্যালেন্স দেখতে',
                        en: '   {pn}: View your money\n   {pn} @tag: View the money of the tagged person',
                        vi: '   {pn}: Xem số tiền của bạn\n   {pn} @tag: Xem số tiền của người được tag'
=======
<<<<<<< HEAD
                        bn: '   {pn}: নিজের ব্যালেন্স দেখতে\n   {pn} @tag: কারো ব্যালেন্স দেখতে',
                        en: '   {pn}: View your money\n   {pn} @tag: View the money of the tagged person',
                        vi: '   {pn}: Xem số tiền của bạn\n   {pn} @tag: Xem số tiền của người được tag'
=======
                        bn: '   {pn}: নিজের ব্যালেন্স দেখতে\n   {pn} @tag: কারো ব্যালেন্স দেখতে\n   {pn} <uid>: UID দিয়ে দেখতে',
                        en: '   {pn}: View your money\n   {pn} @tag: View tagged person\n   {pn} <uid>: View by UID',
                        vi: '   {pn}: Xem số tiền của bạn\n   {pn} @tag: Xem người được tag\n   {pn} <uid>: Xem bằng UID'
>>>>>>> 5ad45cf (ok)
>>>>>>> e4b7481 (Initial commit)
                }
        },

        langs: {
                bn: {
                        money: "বেবি, তোমার কাছে মোট %1$ আছে।",
                        moneyOf: "%1 এর কাছে মোট %2$ আছে।"
                },
                en: {
<<<<<<< HEAD
                        money: "Baby, you have a total of %1$.",
                        moneyOf: "%1 has a total of %2$."
=======
<<<<<<< HEAD
                        money: "Baby, you have a total of %1$.",
                        moneyOf: "%1 has a total of %2$."
=======
                        money: "> 🎀 %2\n\n𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $%1.",
                        moneyOf: "> 🎀 𝐁𝐚𝐛𝐲, %1's 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $%3."
>>>>>>> 5ad45cf (ok)
>>>>>>> e4b7481 (Initial commit)
                },
                vi: {
                        money: "🏦 | Bạn đang có %1$",
                        moneyOf: "💰 | %1 đang có %2$"
                }
        },

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> e4b7481 (Initial commit)
        onStart: async function ({ message, usersData, event, getLang }) {
                const { mentions, senderID } = event;

                 const formatNumber = (num) => {
<<<<<<< HEAD
=======
=======
        onStart: async function ({ message, usersData, event, getLang, args }) {
                const { mentions, senderID, type, messageReply } = event;
                const senderName = await usersData.getName(senderID);

                const formatNumber = (num) => {
>>>>>>> 5ad45cf (ok)
>>>>>>> e4b7481 (Initial commit)
                        if (!num) return "0";
                        let n = typeof num !== "number" ? parseInt(num) || 0 : num;
                        const units = ["", "K", "M", "B", "T"];
                        let unit = 0;
                        while (n >= 1000 && ++unit < units.length) n /= 1000;
                        return n.toFixed(1).replace(/\.0$/, "") + units[unit];
                };

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> e4b7481 (Initial commit)
                if (Object.keys(mentions).length > 0) {
                        const uids = Object.keys(mentions);
                        let msg = "";
                        for (const uid of uids) {
                                const userMoney = await usersData.get(uid, "money");
                                const name = mentions[uid].replace("@", "");
                                msg += getLang("moneyOf", name, formatNumber(userMoney)) + '\n';
                        }
                        return message.reply(msg);
                } else {
                        const userMoney = await usersData.get(senderID, "money");
                        return message.reply(getLang("money", formatNumber(userMoney)));
                }
        }
};
<<<<<<< HEAD
=======
=======
                let targetID = senderID;

                // 🔹 Mention
                if (Object.keys(mentions).length > 0) {
                        targetID = Object.keys(mentions)[0];
                }

                // 🔹 Reply
                else if (type === "message_reply") {
                        targetID = messageReply.senderID;
                }

                // 🔹 UID
                else if (args[0] && !isNaN(args[0])) {
                        targetID = args[0];
                }

                const userMoney = await usersData.get(targetID, "money");
                const targetName = await usersData.getName(targetID);

                // Own balance
                if (targetID == senderID) {
                        return message.reply(
                                getLang("money", formatNumber(userMoney), senderName)
                        );
                }

                // Someone else's balance
                return message.reply(
                        getLang("moneyOf", targetName, senderName, formatNumber(userMoney))
                );
        }
};
>>>>>>> 5ad45cf (ok)
>>>>>>> e4b7481 (Initial commit)
