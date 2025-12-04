const os = require("os");

const startTime = Date.now();

module.exports = {
  config: {
    name: "up2",
    aliases: [],
    version: "0.0.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "system",
    shortDescription: "Show bot uptime & system info",
    longDescription: "Get current uptime, RAM, CPU and bot info (no media)",
    guide: "{pn}",
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      const pingStart = Date.now();
      // No need to send a temporary message. We'll send the final one directly.
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const ping = Date.now() - pingStart;

      const uptimeInMs = Date.now() - startTime;
      const totalSeconds = Math.floor(uptimeInMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
      const cpuModel = os.cpus()[0]?.model || "Unknown CPU";
      const now = new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka", hour12: true });

      const info = `
🔧 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 🔧
────────────────
🟢 Uptime: ${uptime}
📅 Time: ${now}
📡 Ping: ${ping}ms
💻 CPU: ${cpuModel}
📂 OS: ${os.type()} ${os.arch()}
📊 RAM: ${ramUsage} MB used by bot
💾 Memory: ${usedMem} GB / ${totalMem} GB
👥 Users: ${allUsers.length}
💬 Threads: ${allThreads.length}
────────────────`;
      
      await api.sendMessage(info, event.threadID);
    } catch (err) {
      console.error("❌ error:", err);
      return api.sendMessage("⚠ An error occurred while showing system info.", event.threadID);
    }
  },
};