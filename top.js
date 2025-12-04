const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");


const deltaNext = 5;

// Convert EXP to Level
function expToLevel(exp) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

// Format Money
function formatMoney(value) {
  if (value >= 1e15) return (value / 1e15).toFixed(2) + " Qt";
  if (value >= 1e12) return (value / 1e12).toFixed(2) + " T";
  if (value >= 1e9) return (value / 1e9).toFixed(2) + " B";
  if (value >= 1e6) return (value / 1e6).toFixed(2) + " M";
  if (value >= 1e3) return (value / 1e3).toFixed(2) + " k";
  return value.toString();
}

// Cache avatars
const avatarCache = new Map();

// Safe avatar fetch
async function fetchAvatarSafe(userID, usersData) {
  if (avatarCache.has(userID)) return avatarCache.get(userID);

  try {
    let avatarURL = await usersData.getAvatarUrl(userID);
    if (!avatarURL) {
      avatarURL = `https://graph.facebook.com/${userID}/picture?type=large&width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    }
    avatarURL += avatarURL.includes("?") ? "&" : "?";
    avatarURL += `t=${Date.now()}`;

    const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 });
    const img = await loadImage(Buffer.from(res.data));
    avatarCache.set(userID, img);
    return img;
  } catch (e) {
    const size = 100;
    const fallback = createCanvas(size, size);
    const ctx = fallback.getContext("2d");
    ctx.fillStyle = "#3b0066";
    ctx.fillRect(0, 0, size, size);
    ctx.font = `bold ${size / 2}px Bangla`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(userID.charAt(0).toUpperCase(), size / 2, size / 2);
    avatarCache.set(userID, fallback);
    return fallback;
  }
}

// Rounded rectangle helper
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
  return ctx;
}

// Draw leaderboard
async function drawTopBoard(users, type, usersData) {
  const W = 1200, H = 1000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1e1e3f");
  bg.addColorStop(1, "#5c00ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.font = "bold 56px Bangla";
  ctx.fillStyle = "#00ffee";
  ctx.textAlign = "center";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 25;
  ctx.fillText(type === "rank" ? "🏆 Top 10 Rank Leaderboard" : "💰 Top 10 Money Leaderboard", W / 2, 80);

  // Top 3
  const positions = [
    { i: 0, x: W / 2 - 85, y: 140, size: 180, rank: "1st 👑" },
    { i: 1, x: W / 2 - 280, y: 220, size: 140, rank: "2nd" },
    { i: 2, x: W / 2 + 150, y: 220, size: 140, rank: "3rd" },
  ];

  for (const pos of positions) {
    const u = users[pos.i];
    if (!u) continue;

    let avatar;
    try { avatar = await fetchAvatarSafe(u.userID, usersData); } 
    catch { avatar = createCanvas(pos.size, pos.size); }

    ctx.save();
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(pos.x + pos.size / 2, pos.y + pos.size / 2, pos.size / 2 + 15, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(pos.x + pos.size / 2, pos.y + pos.size / 2, pos.size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, pos.x, pos.y, pos.size, pos.size);
    ctx.restore();

    // Name
    ctx.font = "28px Bangla";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    const displayName = u.name ? (u.name.length > 12 ? u.name.slice(0, 12) + "…" : u.name) : "Unknown";
    ctx.fillText(displayName, pos.x + pos.size / 2, pos.y + pos.size + 40);

    // Rank Text
    ctx.font = "24px Bangla";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(pos.rank, pos.x + pos.size / 2, pos.y + pos.size + 70);

    // Value
    ctx.fillStyle = "#ff99ff";
    const value = type === "rank" ? `Lv ${expToLevel(Number(u.totalExp || 0))}` : `${formatMoney(Number(u.money || 0))} 💵`;
    ctx.fillText(value, pos.x + pos.size / 2, pos.y + pos.size + 100);
  }

  // List 4-10
  ctx.font = "26px Bangla";
  const startY = 500, rowH = 60, avatarSize = 50;

  for (let i = 3; i < users.length; i++) {
    const u = users[i];
    const y = startY + (i - 3) * rowH;

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    roundRect(ctx, 50, y - 30, W - 100, rowH - 10, 12).fill();

    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(`#${i + 1}`, 60, y + 10);

    let avatar;
    try { avatar = await fetchAvatarSafe(u.userID, usersData); } 
    catch { avatar = createCanvas(avatarSize, avatarSize); }

    ctx.save();
    ctx.beginPath();
    ctx.arc(130 + avatarSize / 2, y - 15 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 130, y - 15, avatarSize, avatarSize);
    ctx.restore();

    ctx.fillStyle = "#00ffee";
    ctx.textAlign = "left";
    ctx.fillText(u.name || "Unknown", 200, y + 10);

    ctx.fillStyle = "#ff99ff";
    ctx.textAlign = "right";
    const value = type === "rank" ? `Lv ${expToLevel(Number(u.totalExp || 0))} (${u.totalExp || 0})` : `${formatMoney(Number(u.money || 0))} 💵`;
    ctx.fillText(value, W - 80, y + 10);
  }

  // Footer
  ctx.font = "20px Bangla";
  ctx.fillStyle = "#ccc";
  ctx.textAlign = "center";
  ctx.fillText(`🕓 Updated: ${moment().tz("Asia/Dhaka").format("YYYY-MM-DD hh:mm A")}`, W / 2, H - 30);

  const fileName = `top_${type}_${Date.now()}.png`;
  const filePath = path.join(__dirname, "cache", fileName);
  if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);

  return filePath;
}

// Module export
module.exports = {
  config: {
    name: "top",
    version: "3.2",
    author: "Christus",
    countDown: 10,
    role: 0,
    shortDescription: "Show Top 10 Rank/Money leaderboard",
    category: "rank",
    guide: "{pn} rank | money"
  },

  onStart: async function({ api, event, args, usersData, message }) {
    const type = args[0]?.toLowerCase();
    if (!["rank", "money"].includes(type)) return message.reply("⚠️ Use: /top rank or /top money");

    try {
      const allUsers = await usersData.getAll();
      let sorted;

      if (type === "rank") {
        sorted = allUsers.map(u => ({ ...u, totalExp: Number(u.exp || 0) }))
                         .sort((a, b) => b.totalExp - a.totalExp)
                         .slice(0, 10);
      } else {
        sorted = allUsers.map(u => ({ ...u, money: Number(u.money || 0) }))
                         .sort((a, b) => b.money - a.money)
                         .slice(0, 10);
      }

      const filePath = await drawTopBoard(sorted, type, usersData);

      let body = `📊 Top 10 ${type === "rank" ? "Rank" : "Money"} Leaderboard\n\n`;
      for (let i = 0; i < sorted.length; i++) {
        const u = sorted[i];
        const value = type === "rank" ? `Lv ${expToLevel(Number(u.totalExp || 0))} (${u.totalExp || 0})` : `${formatMoney(Number(u.money || 0))} 💵`;
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
        body += `${medal} ${u.name || "Unknown"} — ${value}\n`;
      }

      message.reply({ body, attachment: fs.createReadStream(filePath) });
    } catch (err) {
      console.error("Error generating top board:", err);
      return message.reply("❌ An error occurred while generating the leaderboard.");
    }
  }
};