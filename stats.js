const os = require('os');
const fs = require("fs-extra");
const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');

// Remove the custom fonts and use the default Arial font
// No need to register any font as we will rely on the default system font (Arial).
// If you need to include custom fonts in the future, you can register them similarly.

module.exports = {
 config: {
 name: "stats",
 aliases: [],
 version: "2.1",
 author: "Chrisrus x Aesther",
 countDown: 5,
 role: 0,
 shortDescription: "Show bot statistics",
 longDescription: "Show the statistics of the bot with pie chart",
 category: "𝗜𝗡𝗙𝗢",
 guide: { en: "{pn}" }
 },

 onStart: async function({ api, message, event, usersData }) {
 try {
 const startTime = Date.now();
 const uptime = process.uptime();
 const days = Math.floor(uptime / (3600 * 24));
 const hours = Math.floor((uptime % (3600 * 24)) / 3600);
 const mins = Math.floor((uptime % 3600) / 60);
 const seconds = Math.floor(uptime % 60);
 const uptimeString = `${days} Days ${hours} Hours ${mins} Minutes ${seconds} Seconds`;

 const totalMem = os.totalmem();
 const freeMem = os.freemem();
 const usedMem = totalMem - freeMem;
 const usedGB = (usedMem / (1024 ** 3)).toFixed(2);
 const freeGB = (freeMem / (1024 ** 3)).toFixed(2);

 const cpuCores = os.cpus().length;
 const loadAvg = os.loadavg();

 const totalUsers = await usersData.getAll().then(u => u.length);
 const allThreadIDs = await api.getThreadList(100, null, ["INBOX"]);
 const groupCount = allThreadIDs.filter(thread => thread.isGroup).length;
 const nodeVersion = process.version;
 const ping = Date.now() - startTime;

 const allFiles = fs.readdirSync(__dirname);
 const totalCommands = allFiles.filter(f => f.endsWith('.js')).length;

 const canvas = createCanvas(800, 800);
 const ctx = canvas.getContext('2d');

 const backgroundPath = path.join(__dirname, 'cache/up.jpg');
 if (fs.existsSync(backgroundPath)) {
 const bgImage = await loadImage(backgroundPath);
 ctx.globalAlpha = 0.6;
 ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
 ctx.globalAlpha = 1;
 } else {
 ctx.fillStyle = '#f5f5f5';
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 }

 ctx.fillStyle = '#222';
 ctx.font = "bold 36px Arial"; // Changed to Arial
 ctx.textAlign = 'center';
 ctx.fillText('Bot Statistics Dashboard', canvas.width / 2, 60);

 let y = 160;
 const sysInfo = [
 { label: 'Uptime:', value: uptimeString, color: '#e65100' },
 { label: ' OS:', value: `${os.type()} ${os.release()} (${os.arch()})`, color: '#1e88e5' },
 { label: ' CPU:', value: `${os.cpus()[0].model} (${cpuCores} cores)`, color: '#8e24aa' },
 { label: ' Load:', value: loadAvg.map(l => l.toFixed(2)).join(" | "), color: '#00897b' },
 { label: ' Memory:', value: `${usedGB} GB / ${(totalMem / (1024 ** 3)).toFixed(2)} GB`, color: '#d32f2f' },
 { label: ' Users:', value: totalUsers.toLocaleString(), color: '#f57c00' },
 { label: ' Groups:', value: groupCount.toLocaleString(), color: '#5e35b1' },
 { label: ' Node.js:', value: nodeVersion, color: '#3949ab' },
 { label: ' Total Cmd:', value: totalCommands.toString(), color: '#4e342e' },
 { label: ' Ping:', value: `${ping} ms`, color: '#2e7d32' }
 ];

 for (let info of sysInfo) {
 ctx.font = "bold 29px Arial"; // Changed to Arial
 ctx.textAlign = 'left';
 ctx.fillStyle = info.color;
 ctx.fillText(info.label, 50, y);
 ctx.font = "26px Arial"; // Changed to Arial
 ctx.fillStyle = "#000";
 ctx.fillText(info.value, 280, y);
 y += 38;
 }

 const slices = [
 { label: "Used Memory", value: parseFloat(usedGB), color: "#c62828" },
 { label: "Free Memory", value: parseFloat(freeGB), color: "#1565c0" },
 { label: "CPU Cores", value: cpuCores, color: "#6a1b9a" }
 ];

 let totalValue = slices.reduce((sum, s) => sum + s.value, 0);
 let startAngle = 0;
 const centerX = 620;
 const centerY = 620;
 const radius = 150;

 slices.forEach(slice => {
 const angle = (slice.value / totalValue) * 2 * Math.PI;
 ctx.beginPath();
 ctx.moveTo(centerX, centerY);
 ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
 ctx.closePath();
 ctx.fillStyle = slice.color;
 ctx.fill();
 startAngle += angle;
 });

 let legendY = 400;
 ctx.font = "16px Arial"; // Changed to Arial
 slices.forEach(slice => {
 ctx.fillStyle = slice.color;
 ctx.fillRect(540, legendY, 15, 15);
 ctx.fillStyle = "#000";
 ctx.fillText(`${slice.label}: ${slice.value}`, 560, legendY + 12);
 legendY += 25;
 });

 ctx.font = "18px Arial"; // Changed to Arial
 ctx.fillStyle = "#444";
 ctx.textAlign = "left";
 ctx.fillText("RomeoBot", 40, canvas.height - 20);

 const buffer = canvas.toBuffer('image/png');
 const pathImg = `${__dirname}/tmp/stats.png`;
 fs.ensureDirSync(path.dirname(pathImg));
 fs.writeFileSync(pathImg, buffer);

 const textResponse =
 `⚡ Uptime: ${uptimeString}\n` +
 `💻 OS: ${os.type()} ${os.release()} (${os.arch()})\n` +
 `🧠 CPU: ${os.cpus()[0].model} (${cpuCores} cores)\n` +
 `📊 Load: ${loadAvg.map(l => l.toFixed(2)).join(" | ")}\n` +
 `💾 Memory: ${usedGB}GB / ${(totalMem / (1024 ** 3)).toFixed(2)}GB\n` +
 `👥 Users: ${totalUsers}\n` +
 `👨‍👩‍👧 Groups: ${groupCount}\n\n` +
 `📁 Total Commands: ${totalCommands}\n` +
 `🧾 Node.js: ${nodeVersion}\n` +
 `🏓 Ping: ${ping}ms`;

 message.reply({
 body: textResponse,
 attachment: fs.createReadStream(pathImg)
 }, () => fs.unlinkSync(pathImg));

 } catch (err) {
 console.error(err);
 message.reply("❌ An error occurred while generating the stats.");
 }
 }
};