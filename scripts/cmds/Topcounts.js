const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "topcounts",
    version: "TANJIRO-FINAL-CLEAN",
    role: 0,
    author: "Sakib",
    category: "group"
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      const thread = await threadsData.get(event.threadID);
      if (!thread?.members)
        return api.sendMessage("⚠ No group data.", event.threadID);

      const members = thread.members
        .filter(m => m.inGroup && m.count > 0)
        .sort((a,b) => b.count - a.count);

      if (!members.length)
        return api.sendMessage("⚠ No message data.", event.threadID);

      const width = 1400;
      const height = 2000;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ===== Background Image from Imgur =====
      const bgUrl = "https://i.imgur.com/fv1QqwF.jpeg";
      try {
        const bgImg = await loadImage(bgUrl);
        ctx.drawImage(bgImg, 0, 0, width, height);
      } catch (err) {
        const gradient = ctx.createLinearGradient(0,0,width,height);
        gradient.addColorStop(0,"#0f2027");
        gradient.addColorStop(1,"#203a43");
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,width,height);
      }

      // ===== Title =====
      ctx.textAlign = "center";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 30;
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 70px Arial";
      ctx.fillText("Tanjiro's Top 10 Counts", width/2, 110);
      ctx.shadowBlur = 0;

      const maxCount = members[0].count;

      // ===== TOP 3 avatars only =====
      const positions = [
        { x: width/2, y: 380, size: 150, color: "#FFD700", label: "1ST", trophy:true },
        { x: width/2 - 300, y: 440, size: 120, color: "#C0C0C0", label: "2ND", trophy:false },
        { x: width/2 + 300, y: 440, size: 120, color: "#CD7F32", label: "3RD", trophy:false }
      ];

      for (let i = 0; i < 3 && i < members.length; i++) {
        const user = members[i];
        const pos = positions[i];

        let avatar = null;
        try {
          const url = await usersData.getAvatarUrl(user.userID);
          avatar = await loadImage(url);
        } catch {}

        if (avatar) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.size, 0, Math.PI*2);
          ctx.clip();
          ctx.drawImage(avatar, pos.x-pos.size, pos.y-pos.size, pos.size*2, pos.size*2);
          ctx.restore();
        }

        // Circle stroke
        ctx.strokeStyle = pos.color;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.size+5, 0, Math.PI*2);
        ctx.stroke();

        // Label
        ctx.fillStyle = pos.color;
        ctx.font = "bold 38px Arial";
        ctx.fillText(pos.label, pos.x, pos.y - pos.size - 35);

        // Trophy for 1st
        if(pos.trophy){
          const trophyPath = path.join(__dirname, "../assets/trophy.png");
          if(fs.existsSync(trophyPath)){
            const trophy = await loadImage(trophyPath);
            ctx.drawImage(trophy, pos.x-70, pos.y-pos.size-120, 140, 120);
          }
        }

        // Name & count
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.fillText(user.name, pos.x, pos.y + pos.size + 55);

        ctx.fillStyle = "#00f2ff";
        ctx.font = "bold 28px Arial";
        ctx.fillText(user.count + " msgs", pos.x, pos.y + pos.size + 95);
      }

      // ===== Top 10 List (start from #4) =====
      let y = 750;
      for (let i = 3; i < 10 && i < members.length; i++) { // Start from index 3 (#4)
        const user = members[i];
        const percent = user.count / maxCount;

        ctx.fillStyle = "rgba(255,255,255,0.12)";
        roundRect(ctx, 150, y - 45, 1100, 100, 35);
        ctx.fill();

        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 34px Arial";
        ctx.fillText(`#${i+1}  ${user.name}`, 230, y);

        ctx.textAlign = "right";
        ctx.fillStyle = "#00f2ff";
        ctx.fillText(user.count + " msgs", 1200, y);

        // Progress bar background
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        roundRect(ctx, 450, y + 25, 650, 18, 10);
        ctx.fill();

        // Progress fill
        const grad = ctx.createLinearGradient(450, y + 25, 1100, y + 25);
        grad.addColorStop(0, "#00c6ff");
        grad.addColorStop(1, "#0072ff");
        ctx.fillStyle = grad;
        roundRect(ctx, 450, y + 25, 650 * percent, 18, 10);
        ctx.fill();

        y += 130;
      }

      // ===== Author =====
      ctx.globalAlpha = 0.6;
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.fillText("Author: Sakib", width/2, height - 40);
      ctx.globalAlpha = 1;

      function roundRect(ctx,x,y,w,h,r){
        ctx.beginPath();
        ctx.moveTo(x+r,y);
        ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.closePath();
      }

      const filePath = path.join(__dirname, "tanjiro_final_clean.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return api.sendMessage({
        body: "🔥 TANJIRO FINAL TOP 10 🔥",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ Error occurred.", event.threadID);
    }
  }
};