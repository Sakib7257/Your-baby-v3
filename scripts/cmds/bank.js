module.exports = {
  config: {
    name: "bank",
    version: "2.2",
    author: "SaiF",
    countDown: 10,
    role: 0,
    description: "useless bank system",
    category: "economy",
    guide: {
      en: "{p}bank [bal | -d | -w | loan | top | transfer]"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    const font = (str) => {
      const serif = {
        'a': '𝐚','b': '𝐛','c': '𝐜','d': '𝐝','e': '𝐞','f': '𝐟','g': '𝐠','h': '𝐡','i': '𝐢','j': '𝐣','k': '𝐤','l': '𝐥','m': '𝐦','n': '𝐧','o': '𝐨','p': '𝐩','q': '𝐪','r': '𝐫','s': '𝐬','t': '𝐭','u': '𝐮','v': '𝐯','w': '𝐰','x': '𝐱','y': '𝐲','z': '𝐳',
        'A': '𝐀','B': '𝐁','C': '𝐂','D': '𝐃','E': '𝐄','F': '𝐅','G': '𝐆','H': '𝐇','I': '𝐈','J': '𝐉','K': '𝐊','L': '𝐋','M': '𝐌','N': '𝐍','O': '𝐎','P': '𝐏','Q': '𝐐','R': '𝐑','S': '𝐒','T': '𝐓','U': '𝐔','V': '𝐕','W': '𝐖','X': '𝐗','Y': '𝐘','Z': '𝐙',
        '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒','5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗'
      };
      return str.split('').map(c => serif[c] || c).join('');
    };

    // ===== SAFE USER DATA =====
    let userData = await usersData.get(senderID);
    if (!userData) return api.sendMessage("User not found.", threadID, messageID);

    if (!userData.data) userData.data = {};
    if (!userData.money) userData.money = 0;
    if (!userData.data.bank) userData.data.bank = 0;
    if (!userData.data.loan) userData.data.loan = 0;

    const formatValue = (val) => {
      if (val >= 1e9) return (val / 1e9).toFixed(2) + "B";
      if (val >= 1e6) return (val / 1e6).toFixed(2) + "M";
      if (val >= 1e3) return (val / 1e3).toFixed(1) + "K";
      return val.toString();
    };

    const parseInput = (str) => {
      if (!str) return NaN;
      if (str.toLowerCase() === "all") return "all";
      const unit = str.slice(-1).toUpperCase();
      const num = parseFloat(str);
      if (unit === 'K') return num * 1e3;
      if (unit === 'M') return num * 1e6;
      if (unit === 'B') return num * 1e9;
      return parseInt(str);
    };

    const action = args[0]?.toLowerCase();

    switch (action) {

      // ================= BALANCE =================
      case "bal":
      case "balance":
        return api.sendMessage(
          `${font("╭─[🏦 BANK STATUS 🏦]")}\n` +
          `${font("╰‣ Cash: ")}$${formatValue(userData.money)}\n` +
          `${font("╰‣ Bank: ")}$${formatValue(userData.data.bank)}\n` +
          `${font("╰‣ Loan: ")}$${formatValue(userData.data.loan)}\n\n` +
          `• ${font(userData.name || "User")}`,
          threadID, messageID
        );

      // ================= DEPOSIT =================
      case "-d":
      case "deposit": {
        let dAmt = parseInput(args[1]);
        if (dAmt === "all") dAmt = userData.money;

        if (isNaN(dAmt) || dAmt <= 0)
          return api.sendMessage(font("❌ Invalid amount!"), threadID, messageID);

        if (userData.money < dAmt)
          return api.sendMessage(font("❌ Insufficient cash!"), threadID, messageID);

        userData.money -= dAmt;
        userData.data.bank += dAmt;

        await usersData.set(senderID, userData);

        return api.sendMessage(
          font(`>😽 Deposited $${formatValue(dAmt)}`),
          threadID, messageID
        );
      }

      // ================= WITHDRAW =================
      case "-w":
      case "withdraw": {
        let wAmt = parseInput(args[1]);
        if (wAmt === "all") wAmt = userData.data.bank;

        if (isNaN(wAmt) || wAmt <= 0)
          return api.sendMessage(font("❌ Invalid amount!"), threadID, messageID);

        if (userData.data.bank < wAmt)
          return api.sendMessage(font("❌ Insufficient bank balance!"), threadID, messageID);

        userData.data.bank -= wAmt;
        userData.money += wAmt;

        await usersData.set(senderID, userData);

        return api.sendMessage(
          font(`>💵 Withdrawn $${formatValue(wAmt)}`),
          threadID, messageID
        );
      }

      // ================= LOAN =================
      case "loan": {
        let lAmt = parseInput(args[1]);

        if (isNaN(lAmt) || lAmt <= 0)
          return api.sendMessage(font("❌ Invalid loan amount!"), threadID, messageID);

        if (userData.data.loan > 0)
          return api.sendMessage(font("❌ You already have unpaid loan!"), threadID, messageID);

        const maxLoan = 5000000;
        if (lAmt > maxLoan)
          return api.sendMessage(font("❌ Max loan is 5M!"), threadID, messageID);

        userData.data.loan += lAmt;
        userData.money += lAmt;

        await usersData.set(senderID, userData);

        return api.sendMessage(
          font(`💳 Loan Approved $${formatValue(lAmt)}`),
          threadID, messageID
        );
      }

      // ================= TRANSFER =================
      case "transfer": {
        let targetID, tAmt;

        if (type === "message_reply") {
          targetID = messageReply.senderID;
          tAmt = parseInput(args[1]);
        } else if (Object.keys(mentions).length > 0) {
          targetID = Object.keys(mentions)[0];
          tAmt = parseInput(args[2]);
        } else {
          return api.sendMessage(font("❌ Mention or reply to user!"), threadID, messageID);
        }

        if (isNaN(tAmt) || tAmt <= 0)
          return api.sendMessage(font("❌ Invalid amount!"), threadID, messageID);

        if (userData.data.bank < tAmt)
          return api.sendMessage(font("❌ Insufficient bank balance!"), threadID, messageID);

        let receiver = await usersData.get(targetID);
        if (!receiver) return api.sendMessage(font("❌ User not found!"), threadID, messageID);

        if (!receiver.data) receiver.data = {};
        if (!receiver.data.bank) receiver.data.bank = 0;

        userData.data.bank -= tAmt;
        receiver.data.bank += tAmt;

        await usersData.set(senderID, userData);
        await usersData.set(targetID, receiver);

        return api.sendMessage(
          font(`✅ Transferred $${formatValue(tAmt)} to ${receiver.name || "User"}`),
          threadID, messageID
        );
      }

      // ================= TOP =================
      case "top": {
        let all = await usersData.getAll();

        all.forEach(u => {
          if (!u.data) u.data = {};
          if (!u.data.bank) u.data.bank = 0;
        });

        const top = all
          .sort((a, b) => b.data.bank - a.data.bank)
          .slice(0, 15);

        let msg = font("TOP 15 RICH USERS 🏦") + "\n\n";

        top.forEach((u, i) => {
          let badge = i === 0 ? "🥇" :
                      i === 1 ? "🥈" :
                      i === 2 ? "🥉" : `${i + 1}.`;

          msg += `${badge} ${u.name || "User"} $${formatValue(u.data.bank)}\n`;
        });

        return api.sendMessage(msg, threadID, messageID);
      }

      // ================= DEFAULT =================
      default:
        return api.sendMessage(
          font("╭─ [🏦 MIKASA BANK 🏦]") + "\n" +
          font("├‣ bank balance") + "\n" +
          font("├‣ bank Deposit") + "\n" +
          font("├‣ bank Withdraw") + "\n" +
          font("├‣ bank loan") + "\n" +
          font("├‣ bank transfer") + "\n" +
          font("╰‣ bank top") + "\n\n" +
          font("•Owner: Tanjiro 🎀"),
          threadID, messageID
        );
    }
  }
};