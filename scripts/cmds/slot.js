const slotMemory = {};

module.exports = {
  config: {
    name: "slot",
    version: "2.2",
    author: "SaiF",
    countDown: 10,
    category: "game"
  },

  langs: {
    en: {
      invalid_amount: "𝐏𝐥𝐞𝐚𝐬𝐞 𝐄𝐧𝐭𝐞𝐫 𝐕𝐚𝐥𝐢𝐝 𝐀𝐦𝐨𝐮𝐧𝐭",
      not_enough_money: "• 𝐏𝐥𝐞𝐚𝐬𝐞 𝐂𝐡𝐞𝐜𝐤 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥𝐚𝐧𝐜𝐞",
      too_much_bet: ">🥹 𝐁𝐚𝐛𝐲, 𝐌𝐚𝐱 𝐁𝐞𝐭 𝐈𝐬 𝟏𝟎𝐌",
      cooldown: "• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐇𝐚𝐯𝐞 𝐑𝐞𝐚𝐜𝐡𝐞𝐝 𝟐𝟎 𝐏𝐥𝐚𝐲𝐬.\n𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧 𝐀𝐟𝐭𝐞𝐫 %1 ⏳",
      usage: `𝐒𝐋𝐎𝐓 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 

• 𝐬𝐥𝐨𝐭 my — 𝐒𝐡𝐨𝐰 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐭𝐬
• 𝐬𝐥𝐨𝐭 top [𝐩𝐚𝐠𝐞] — 𝐒𝐡𝐨𝐰 𝐭𝐨𝐩 𝐩𝐥𝐚𝐲𝐞𝐫𝐬 (𝐩𝐚𝐠𝐞 𝐨𝐩𝐭𝐢𝐨𝐧𝐚𝐥)
• 𝐬𝐥𝐨𝐭 [𝐚𝐦𝐨𝐮𝐧𝐭] — 𝐏𝐥𝐚𝐲 𝐭𝐡𝐞 𝐬𝐥𝐨𝐭 𝐠𝐚𝐦𝐞
• 𝐬𝐥𝐨𝐭 info — 𝐒𝐡𝐨𝐰 𝐭𝐡𝐢𝐬 𝐦𝐞𝐧𝐮

[ OWNER: Ryuzaki ]🚩`
    }
  },

  onStart: async function({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    let userData = await usersData.get(senderID);
    if (!userData.data) userData.data = {};

    // ===== INIT STATS =====
    if (!userData.data.slotStats) userData.data.slotStats = { win:0, lose:0, plays:0, highestBet:0 };
    const stats = userData.data.slotStats;

    // ===== .slot info =====
    if (args[0] === "info") return message.reply(getLang("usage"));

    // ===== .slot my =====
    if (args[0] === "my") {
      const rank = await getUserRank(senderID, usersData);
      return message.reply(
`𝐒𝐋𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 | 🎀

• 𝐖𝐢𝐧𝐬: ${stats.win}
• 𝐋𝐨𝐬𝐬𝐞𝐬: ${stats.lose}
• 𝐏𝐥𝐚𝐲𝐬: ${stats.plays}
• 𝐇𝐢𝐠𝐡𝐞𝐬𝐭 𝐁𝐞𝐭: ${formatMoney(stats.highestBet)}
• 𝐑𝐚𝐧𝐤: #${rank}`
      );
    }

    // ===== .slot top / rank (paginated) =====
    if (args[0] === "top" || args[0] === "rank") {
      const page = Math.max(1, parseInt(args[1]) || 1);
      const perPage = 15;
      const all = await usersData.getAll();

      // Include all users who played (even 0 wins)
      let list = [];
      for (const u of all) {
        const s = u.data?.slotStats;
        if (s) list.push({ name: u.name || "User", win: s.win || 0 });
      }

      list.sort((a, b) => b.win - a.win);
      list.splice(100); // Only top 100
      const totalPages = Math.ceil(list.length / perPage) || 1;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const pageList = list.slice(start, end);

      let msg = `👑 | SLOT LEADERBOARD\n\n`;
      pageList.forEach((u, i) => {
        const rank = start + i + 1;
        let line = "";
        if (rank === 1) line = `🥇 ${u.name} — ${u.win} wins`;
        else if (rank === 2) line = `🥈 ${u.name} — ${u.win} wins`;
        else if (rank === 3) line = `🥉 ${u.name} — ${u.win} wins`;
        else line = `${rank}. ${u.name} — ${u.win} wins`;
        msg += line + "\n";
      });

      return message.reply(msg);
    }

    // ===== GAME START =====
    const amount = parseShorthand(args[0]);
    const maxBet = 10_000_000;
    const maxPlays = 20;
    const cooldown = 10*60*60*1000;
    const now = Date.now();

    if(!slotMemory[senderID]) slotMemory[senderID] = { count:0, lastReset:now };
    const userSlot = slotMemory[senderID];

    if(now-userSlot.lastReset>=cooldown){
      userSlot.count=0;
      userSlot.lastReset=now;
    }
    if(userSlot.count>=maxPlays){
      const timeLeft = cooldown-(now-userSlot.lastReset);
      return message.reply(getLang("cooldown", formatTime(timeLeft)));
    }

    if(isNaN(amount)||amount<=0) return message.reply(getLang("invalid_amount"));
    if(amount>maxBet) return message.reply(getLang("too_much_bet"));
    if(amount>userData.money) return message.reply(getLang("not_enough_money"));

    // ===== SLOT ROLL ~30% WIN =====
    const slots = ["🩶","💛","💙","💜","🤎"];
    const results = [
      slots[Math.floor(Math.random()*slots.length)],
      slots[Math.floor(Math.random()*slots.length)],
      slots[Math.floor(Math.random()*slots.length)]
    ];

    const winChance = 30;
    if(Math.random()*100<winChance) results[1]=results[0];
    else if(results[0]===results[1] && results[1]===results[2]) results[2]=slots[Math.floor(Math.random()*slots.length)];

    const winnings = calculateWinnings(results, amount);

    // ===== UPDATE STATS =====
    stats.plays++;
    if(amount>stats.highestBet) stats.highestBet=amount;
    if(winnings>0) stats.win++; else stats.lose++;

    await usersData.set(senderID, { money: userData.money+winnings, data: userData.data });

    userSlot.count++;
    return message.reply(formatResult(results, winnings));
  }
};

// ================= HELPERS =================
function parseShorthand(input){
  if(!input) return NaN;
  const str=input.toUpperCase();
  let mult=1;
  if(str.endsWith("K")) mult=1e3;
  else if(str.endsWith("M")) mult=1e6;
  else if(str.endsWith("B")) mult=1e9;
  return parseFloat(str.replace(/[KMB]/,""))*mult;
}

function calculateWinnings([a,b,c],bet){
  if(a===b && b===c) return bet*5;
  if(a===b || a===c || b===c) return bet*2;
  return -bet;
}

function formatResult([a,b,c],winnings){
  const slotDisplay=`• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: [ ${a} | ${b} | ${c} ]`;
  const money=formatMoney(Math.abs(winnings));
  let text="";
  if(a===b && b===c) text=`• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐇𝐢𝐭 𝐉𝐚𝐜𝐤𝐩𝐨𝐭 🪽\n• 𝐖𝐨𝐧: ${money}$`;
  else if(winnings>0) text=`• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐖𝐨𝐧 ${money}$`;
  else text=`• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐋𝐨𝐬𝐭 ${money}$`;
  return `>🎀\n${text}\n${slotDisplay}`;
}

function formatMoney(n){
  if(n>=1e9) return (n/1e9).toFixed(2)+"𝐁";
  if(n>=1e6) return (n/1e6).toFixed(2)+"𝐌";
  if(n>=1e3) return (n/1e3).toFixed(2)+"𝐊";
  return n.toString();
}

function formatTime(ms){
  const h=Math.floor(ms/3600000);
  const m=Math.floor((ms%3600000)/60000);
  const s=Math.floor((ms%60000)/1000);
  return `${h}𝐡 ${m}𝐦 ${s}𝐬`;
}

async function getUserRank(uid,usersData){
  const all=await usersData.getAll();
  let list=[];
  for(const u of all){
    const s=u.data?.slotStats;
    if(s) list.push({id:u.userID, win:s.win||0});
  }
  list.sort((a,b)=>b.win-a.win);
  return list.findIndex(u=>u.id===uid)+1;
}