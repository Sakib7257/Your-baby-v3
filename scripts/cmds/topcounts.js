const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

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
      const fontPath = path.join(__dirname, "noto-bengali.ttf");
      
      if (!fs.existsSync(fontPath)) {
        const fontUrl = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Bold.ttf";
        const response = await axios.get(fontUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(fontPath, Buffer.from(response.data));
      }
      
      // Font family name অবশ্যই কোটেশনের ভেতর সঠিক হতে হবে
      registerFont(fontPath, { family: "BengaliFont" });
      const mainFont = "BengaliFont"; 

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

      const bgUrl = "https://i.imgur.com/fv1QqwF.jpeg";
      try {
        const bgImg = await loadImage(bgUrl);
        ctx.drawImage(bgImg, 0, 0, width, height);
      } catch (err) {
        ctx.fillStyle = "#0f2027";
        ctx.fillRect(0,0,width,height);
      }

      ctx.textAlign = "center";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 30;
      ctx.fillStyle = "#00ffff";
      // Font declaration এ bold সরিয়ে শুধু ফন্ট ফ্যামিলি ট্রাই করুন যদি সমস্যা থাকে
      ctx.font = `70px ${mainFont}`;
      ctx.fillText("Tanjiro's Top 10 Counts", width/2, 110);
      ctx.shadowBlur = 0;

      const maxCount = members[0].count;

      const positions = [
        { x: width/2, y: 380, size: 150, color: "#FFD700", label: "1ST" },
        { x: width/2 - 300, y: 440, size: 120, color: "#C0C0C0", label: "2ND" },
        { x: width/2 + 300, y: 440, size: 120, color: "#CD7F32", label: "3RD" }
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

        ctx.strokeStyle = pos.color;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.size+5, 0, Math.PI*2);
        ctx.stroke();

        ctx.fillStyle = pos.color;
        ctx.font = `38px ${mainFont}`;
        ctx.fillText(pos.label, pos.x, pos.y - pos.size - 35);

        ctx.fillStyle = "#ffffff";
        ctx.font = `32px ${mainFont}`;
        ctx.fillText(user.name || "Unknown", pos.x, pos.y + pos.size + 55);

        ctx.fillStyle = "#00f2ff";
        ctx.font = `28px ${mainFont}`;
        ctx.fillText(user.count + " msgs", pos.x, pos.y + pos.size + 95);
      }

      let y = 750;
      for (let i = 3; i < 10 && i < members.length; i++) {
        const user = members[i];
        const percent = user.count / maxCount;

        ctx.fillStyle = "rgba(255,255,255,0.12)";
        roundRect(ctx, 150, y - 45, 1100, 100, 35);
        ctx.fill();

        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.font = `34px ${mainFont}`;
        ctx.fillText(`#${i+1}  ${user.name || "Unknown"}`, 230, y);

        ctx.textAlign = "right";
        ctx.fillStyle = "#00f2ff";
        ctx.font = `34px ${mainFont}`;
        ctx.fillText(user.count + " msgs", 1200, y);

        ctx.fillStyle = "rgba(255,255,255,0.25)";
        roundRect(ctx, 450, y + 25, 650, 18, 10);
        ctx.fill();

        const grad = ctx.createLinearGradient(450, y + 25, 1100, y + 25);
        grad.addColorStop(0, "#00c6ff");
        grad.addColorStop(1, "#0072ff");
        ctx.fillStyle = grad;
        roundRect(ctx, 450, y + 25, (650 * percent) || 1, 18, 10);
        ctx.fill();

        y += 130;
      }

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

      const filePath = path.join(__dirname, `top10_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return api.sendMessage({
        body: "TOP 10 counts🎀",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ Error occurred.", event.threadID);
    }
  }
};