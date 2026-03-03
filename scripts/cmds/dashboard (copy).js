const { createCanvas } = require("canvas");
const os = require("os");
const fs = require("fs");
const path = require("path");

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawIcon(ctx, x, y, letter, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.fillText(letter, x - 7, y + 7);
}

async function generateDashboard(analyticsData, usersData) {
  try {
    const width = 1600;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    /* Background */
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#0b1120");
    bg.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    /* Header */
    ctx.fillStyle = "#1f2937";
    roundRect(ctx, 80, 50, 1440, 90, 25);

    ctx.fillStyle = "white";
    ctx.font = "bold 42px Arial";
    ctx.fillText("Tanjiro Bot Global Dashboard", 230, 110);

    /* Avatar */
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(150, 95, 40, 0, Math.PI * 2);
    ctx.fill();

    /* LEFT PANEL */
    const leftX = 80;
    const leftY = 180;

    ctx.fillStyle = "#1f2937";
    roundRect(ctx, leftX, leftY, 460, 640, 30);

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 26px Arial";
    ctx.fillText("SYSTEM INFO", leftX + 35, leftY + 55);

    const systemData = [
      ["V", "#22c55e", "VERSION", "2.5.6"],
      ["N", "#3b82f6", "NODE", process.version],
      ["P", "#8b5cf6", "PLATFORM", os.platform()],
      ["A", "#ef4444", "ARCH", os.arch()],
      ["T", "#f59e0b", "UPTIME", Math.floor(process.uptime()/60)+"m"]
    ];

    let y = leftY + 120;

    systemData.forEach(item => {
      drawIcon(ctx, leftX + 60, y - 10, item[0], item[1]);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "16px Arial";
      ctx.fillText(item[2], leftX + 110, y - 15);

      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.fillText(item[3], leftX + 110, y + 10);

      y += 100;
    });

    /* MIDDLE TOP */
    const midX = 600;
    const midY = 180;

    ctx.fillStyle = "#1f2937";
    roundRect(ctx, midX, midY, 500, 260, 30);

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 26px Arial";
    ctx.fillText("USER & GROUP INFO", midX + 35, midY + 55);

    const totalUsers = (await usersData.getAll().catch(()=>[])).length;

    drawIcon(ctx, midX + 70, midY + 120, "U", "#3b82f6");
    ctx.fillStyle = "white";
    ctx.font = "bold 22px Arial";
    ctx.fillText("USERS", midX + 120, midY + 110);
    ctx.fillText(totalUsers, midX + 120, midY + 140);

    drawIcon(ctx, midX + 70, midY + 190, "G", "#22c55e");
    ctx.fillText("GROUPS", midX + 120, midY + 180);
    ctx.fillText("0", midX + 120, midY + 210);

    /* PERFORMANCE */
    const perfY = 470;

    ctx.fillStyle = "#1f2937";
    roundRect(ctx, midX, perfY, 500, 350, 30);

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 26px Arial";
    ctx.fillText("PERFORMANCE", midX + 35, perfY + 55);

    drawIcon(ctx, midX + 70, perfY + 120, "C", "#3b82f6");

    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px Arial";
    ctx.fillText("CPU MODEL", midX + 120, perfY + 110);

    ctx.fillStyle = "white";
    ctx.fillText(os.cpus()[0].model.slice(0,25), midX + 120, perfY + 140);

    const totalMem = os.totalmem()/1024/1024/1024;
    const usedMem = (os.totalmem()-os.freemem())/1024/1024/1024;
    const ratio = usedMem/totalMem;

    ctx.fillStyle = "#9ca3af";
    ctx.fillText("RAM USAGE", midX + 60, perfY + 200);

    ctx.fillStyle = "#374151";
    ctx.fillRect(midX + 60, perfY + 220, 380, 6);

    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(midX + 60, perfY + 220, 380*ratio, 6);

    ctx.fillStyle = "white";
    ctx.fillText(
      usedMem.toFixed(1)+"GB / "+totalMem.toFixed(1)+"GB",
      midX + 60,
      perfY + 260
    );

    /* RIGHT PANEL */
    const rightX = 1140;
    const rightY = 180;

    ctx.fillStyle = "#1f2937";
    roundRect(ctx, rightX, rightY, 460, 640, 30);

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 26px Arial";
    ctx.fillText("TOP 10 COMMANDS USE", rightX + 35, rightY + 55);

    const commandData =
      analyticsData?.data && typeof analyticsData.data === "object"
        ? analyticsData.data
        : {};

    const sorted = Object.entries(commandData)
      .map(([n,h])=>({name:n,hits:Number(h)||0}))
      .sort((a,b)=>b.hits-a.hits)
      .slice(0,10);

    let cmdY = rightY + 110;
    const maxHits = sorted[0]?.hits || 1;

    sorted.forEach((cmd,i)=>{
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 18px Arial";
      ctx.fillText(i+1+".", rightX + 40, cmdY);

      ctx.fillStyle = "white";
      ctx.fillText(cmd.name.toUpperCase(), rightX + 70, cmdY);

      ctx.fillStyle = "#22d3ee";
      ctx.fillText(cmd.hits+" Times", rightX + 260, cmdY);

      ctx.fillStyle = "#374151";
      ctx.fillRect(rightX + 70, cmdY + 15, 330, 3);

      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(
        rightX + 70,
        cmdY + 15,
        330*(cmd.hits/maxHits),
        3
      );

      cmdY += 55;
    });

    return canvas.toBuffer("image/png");

  } catch (err) {
    console.error(err);
    return null;
  }
}

module.exports = {
  config: {
    name: "dashboard",
    version: "12.0",
    category: "system",
    role: 0
  },

  onStart: async function ({ api, event, globalData, usersData }) {
    try {
      const analytics = await globalData.get("analytics").catch(()=>null);
      const buffer = await generateDashboard(analytics, usersData);

      if (!buffer)
        return api.sendMessage("Failed to generate dashboard.", event.threadID);

      const cacheDir = path.join(__dirname,"cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir,"dashboard.png");
      fs.writeFileSync(filePath, buffer);

      return api.sendMessage(
        {
          body: "Tanjiro Bot Global Dashboard",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        ()=>fs.unlinkSync(filePath),
        event.messageID
      );

    } catch(err){
      console.error(err);
      api.sendMessage("Dashboard crashed.", event.threadID);
    }
  }
};