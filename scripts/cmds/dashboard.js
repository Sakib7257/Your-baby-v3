const { createCanvas } = require("canvas");
const os = require("os");
const fs = require("fs");
async function generateDashboard(analyticsData, usersData) {
  const globalUsers = (await usersData.getAll()).length;

  try {
    
    const width = 1200;
    const height = 700;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // =============================
    // SAFE DATA EXTRACTION
    // =============================

    const commandData =
      analyticsData &&
      typeof analyticsData === "object" &&
      analyticsData.data &&
      typeof analyticsData.data === "object"
        ? analyticsData.data
        : {};

    const sorted = Object.entries(commandData)
      .map(([name, hits]) => ({
        name: String(name),
        hits: Number(hits) || 0
      }))
      .sort((a, b) => b.hits - a.hits);

    const top10 = sorted.slice(0, 10);
    const totalCmdsUsed = sorted.reduce((sum, cmd) => sum + cmd.hits, 0);
    const commandSize = global?.GoatBot?.commands?.size || 0;
    const maxHits = top10[0]?.hits || 1;

    // =============================
    // BACKGROUND
    // =============================

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, 80);

    ctx.fillStyle = "#ff4da6";
    ctx.font = "bold 32px Arial";
    ctx.fillText("TANJIRO BOT - Dashboard", 40, 50);

    // =============================
    // LEFT SIDE
    // =============================

    const leftX = 40;
    let leftY = 120;

    const cardWidth = 320;
    const cardHeight = 90;

    const leftData = [
      { label: "VERSION", value: "2.0.0", color: "#22c55e", icon: "V" },
      { label: "NODE_JS", value: process.version, color: "#3b82f6", icon: "N" },
      { label: "UPTIME", value: Math.floor(process.uptime()/60)+"m", color: "#f59e0b", icon: "U" },
      { label: "TOTAL CMDS", value: commandSize, color: "#a855f7", icon: "C" }
    ];

    leftData.forEach(item => {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(leftX, leftY, cardWidth, cardHeight);

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(leftX + 45, leftY + 45, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 18px Arial";
      ctx.fillText(item.icon, leftX + 38, leftY + 52);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px Arial";
      ctx.fillText(item.label, leftX + 90, leftY + 35);

      ctx.fillStyle = "white";
      ctx.font = "bold 22px Arial";
      ctx.fillText(String(item.value), leftX + 90, leftY + 65);

      leftY += 110;
    });

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(leftX, leftY, cardWidth, 90);

    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    ctx.fillText(globalUsers, leftX + 20, leftY + 50);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px Arial";
    ctx.fillText("GLOBAL USERS", leftX + 20, leftY + 75);

    // =============================
    // RIGHT SIDE
    // =============================

    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.fillText("Top 10 Command Usage", 420, 130);

    top10.forEach((cmd, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const cardX = 420 + col * 350;
      const cardY = 170 + row * 90;

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(cardX, cardY, 320, 70);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 16px Arial";
      ctx.fillText(`${i + 1}. ${cmd.name}`, cardX + 15, cardY + 25);

      ctx.fillStyle = "#ff4da6";
      ctx.fillText(`${cmd.hits} hits`, cardX + 180, cardY + 25);

      ctx.fillStyle = "#334155";
      ctx.fillRect(cardX + 15, cardY + 40, 290, 8);

      ctx.fillStyle = "#2dd4bf";
      ctx.fillRect(
        cardX + 15,
        cardY + 40,
        (cmd.hits / maxHits) * 290,
        8
      );
    });

    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(420, 620, 670, 50);

    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(
      `OS: ${os.type()} ${os.arch()} | Platform: ${os.platform()} | CPU: ${os.cpus().length}`,
      440,
      650
    );

    const buffer = canvas.toBuffer("image/png");
return buffer;

  } catch (error) {
    console.error("Dashboard Generation Error:", error);
    return null;
  }
}

module.exports = {
  config: {
    name: "dashboard",
    version: "2.1",
    category: "system",
    author: "Sakib",
    role: 0,
    description: "Professional dashboard for bot analytics"
  },

  onStart: async function ({ api, event, globalData, usersData }) {
    try {
      const analytics = await globalData.get("analytics").catch(() => null);

      const buffer = await generateDashboard(analytics, usersData);

      if (!buffer) {
        return api.sendMessage("❌ Failed to generate dashboard.", event.threadID);
      }
      const pth = __dirname+'/cache/dashboard.png';
fs.writeFileSync(pth, buffer);
      return api.sendMessage(
        { body: "TANJIRO BOT DASHBOARD", attachment: fs.createReadStream(pth) },
        event.threadID, () => fs.unlinkSync(pth), event.messageID
      );

    } catch (err) {
      console.error("Dashboard Command Error:", err);
      return api.sendMessage(
        "❌ Error loading analytics data.",
        event.threadID
      );
    }
  }
};