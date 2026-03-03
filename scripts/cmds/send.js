module.exports = {
  config: {
    name: "send",
    aliases: ["give"],
    version: "4.2",
    author: "Sakib♡︎",
    countDown: 5,
    role: 0,
    category: "economy"
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {

      const type = args[0]?.toLowerCase();
      if (!["money", "exp"].includes(type))
        return api.sendMessage("❌ | Use 'money' or 'exp'.", event.threadID, event.messageID);

      // 🔥 Advanced Parser
      const parseAmount = (input) => {
        if (!input) return 0;

        input = input.toLowerCase().replace(/\s+/g, "");

        const match = input.match(/^([\d.]+)([kmbt]?|e\d+)?$/);
        if (!match) return 0;

        let number = parseFloat(match[1]);
        let suffix = match[2] || "";

        const multipliers = {
          k: 1e3,
          m: 1e6,
          b: 1e9,
          t: 1e12
        };

        if (multipliers[suffix]) {
          return Math.floor(number * multipliers[suffix]);
        }

        if (suffix.startsWith("e")) {
          return Math.floor(number * Math.pow(10, parseInt(suffix.slice(1))));
        }

        return Math.floor(number);
      };

      let targetID;
      let amountRaw;

      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
        amountRaw = args[1];
      }

      else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
        amountRaw = args[1];
      }

      else if (!isNaN(args[1])) {
        targetID = args[1];
        amountRaw = args[2];
      }

      const amount = parseAmount(amountRaw);

      if (!targetID)
        return api.sendMessage("❌ | Mention, reply, or provide UID.", event.threadID, event.messageID);

      if (!amount || amount <= 0)
        return api.sendMessage("❎ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐬𝐩𝐞𝐜𝐢𝐟𝐲 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭.", event.threadID, event.messageID);

      if (targetID == event.senderID)
        return api.sendMessage("❌ | You cannot send to yourself.", event.threadID, event.messageID);

      const sender = await usersData.get(event.senderID);
      const receiver = await usersData.get(targetID);

      const senderMoney = sender.money || 0;
      const receiverMoney = receiver?.money || 0;

      const senderExp = sender.exp || 0;
      const receiverExp = receiver?.exp || 0;

      if (type === "money" && senderMoney < amount)
        return api.sendMessage("❌ | Not enough money.", event.threadID, event.messageID);

      if (type === "exp" && senderExp < amount)
        return api.sendMessage("❌ | Not enough EXP.", event.threadID, event.messageID);

      if (type === "money") {
        await usersData.set(event.senderID, { money: senderMoney - amount });
        await usersData.set(targetID, { money: receiverMoney + amount });
      }

      if (type === "exp") {
        await usersData.set(event.senderID, { exp: senderExp - amount });
        await usersData.set(targetID, { exp: receiverExp + amount });
      }
const formatShort = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, "") + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, "") + "K";
  return num.toString();
};
      const shortAmount = formatShort(amount);

const receipt =
`✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐬𝐞𝐧𝐭 ${shortAmount} ${type.toUpperCase()} to ${receiver.name}.`;

      return api.sendMessage(receipt, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ | Transfer failed.", event.threadID, event.messageID);
    }
  }
};