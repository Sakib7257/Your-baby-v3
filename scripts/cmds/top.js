
module.exports =
{
  config: {
    name: "top",
    version: "2.3",
    author: "Saif",
    role: 0,
    shortDescription: {
      en: "Top users leaderboard"
    },
    longDescription: {
      en: "Top richest, exp, group msg count & global msg count users"
    },
    category: "group",
    guide: {
      en: ".top | .top exp | .top count | .top global | .top info"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {

    // ===== INFO =====
    if (args[0] === "info") {
      return message.reply(
`
>📊
𝐓𝐎𝐏 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎

• top        - Top Richest Users 
• top exp    - Top EXP Users 
• top count  - Top Group Chatters 
• top global - Top Global Chatters

•𝐀𝐝𝐦𝐢𝐧: 𝐒𝐚𝐢𝐅 `
      );
    }

    const allUsers = await usersData.getAll();
    const medals = ["🥇", "🥈", "🥉"];

    // ===== Fancy Font =====
    function toFancy(str) {
      const map = {
        a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',
        i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',
        q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',
        y:'𝐲',z:'𝐳',
        A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',
        I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',
        Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',
        Y:'𝐘',Z:'𝐙',
        0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',
        5:'𝟓',6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'
      };
      return str.split('').map(c => map[c] || c).join('');
    }

    // ===== Short Scale Format =====
    function formatNumber(amount) {
      if (amount >= 1e12) return (amount / 1e12).toFixed(2) + 'T';
      if (amount >= 1e9) return (amount / 1e9).toFixed(2) + 'B';
      if (amount >= 1e6) return (amount / 1e6).toFixed(2) + 'M';
      if (amount >= 1e3) return (amount / 1e3).toFixed(2) + 'K';
      return amount.toString();
    }

    let title = "";
    let list = [];

    // ===== DEFAULT: TOP MONEY =====
    if (!args[0]) {
      title = "𝐓𝐨𝐩 𝟏𝟓 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬 >👑";
      list = allUsers
        .sort((a, b) => (b.money || 0) - (a.money || 0))
        .slice(0, 15)
        .map((u, i) =>
          `${medals[i] || ""} ${toFancy((i+1)+"")} ${toFancy(u.name)} : ${toFancy(formatNumber(u.money || 0))}`
        );
    }

    // ===== TOP EXP =====
    else if (args[0] === "exp") {
      title = "𝐓𝐨𝐩 𝟏𝟓 𝐄𝐗𝐏 𝐔𝐬𝐞𝐫𝐬 >🕸️";
      list = allUsers
        .sort((a, b) => (b.exp || 0) - (a.exp || 0))
        .slice(0, 15)
        .map((u, i) =>
          `${medals[i] || ""} ${toFancy((i+1)+"")} ${toFancy(u.name)} : ${toFancy(formatNumber(u.exp || 0))}`
        );
    }

    // ===== TOP GROUP MSG COUNT =====
    else if (args[0] === "count") {
      title = "𝐓𝐨𝐩 𝟏𝟓 𝐆𝐫𝐨𝐮𝐩 𝐂𝐡𝐚𝐭𝐭𝐞𝐫𝐬 >📨";
      list = allUsers
        .sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0))
        .slice(0, 15)
        .map((u, i) =>
          `${medals[i] || ""} ${toFancy((i+1)+"")} ${toFancy(u.name)} : ${toFancy(formatNumber(u.messageCount || 0))}`
        );
    }

    // ===== TOP GLOBAL MSG COUNT =====
    else if (args[0] === "global") {
      title = "𝐓𝐨𝐩 𝟏𝟓 𝐆𝐥𝐨𝐛𝐚𝐥 𝐂𝐡𝐚𝐭𝐭𝐞𝐫𝐬 >🌍";
      list = allUsers
        .sort((a, b) => (b.globalMessageCount || 0) - (a.globalMessageCount || 0))
        .slice(0, 15)
        .map((u, i) =>
          `${medals[i] || ""} ${toFancy((i+1)+"")} ${toFancy(u.name)} : ${toFancy(formatNumber(u.globalMessageCount || 0))}`
        );
    }

    return message.reply(`${title}\n\n${list.join("\n")}`);
  }
};