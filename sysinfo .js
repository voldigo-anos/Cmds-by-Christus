const os = require("os");
const moment = require("moment");

module.exports = {
  config: {
    name: "sysinfo",
    version: "3.0",
    role: 0,
    author: "Christus x Aesther",
    countDown: 5,
    shortDescription: "Shows detailed system information with ping",
    longDescription: {
      en: "Displays system info like CPU, RAM, OS, uptime, ping, etc."
    },
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const startTime = Date.now();

    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = ((usedMem / totalMem) * 100).toFixed(2);
    const uptime = os.uptime();
    const network = os.networkInterfaces();
    const timeNow = moment().format("HH:mm:ss - DD/MM/YYYY");

    let networkInfo = "";
    for (const iface in network) {
      network[iface].forEach(item => {
        if (item.family === "IPv4") {
          networkInfo += `→ ${iface}: ${item.address}\n`;
        }
      });
    }

    const ping = Date.now() - startTime;

    const message =
`📊 SYSTEM INFORMATION 📊

🔹 Hostname     : ${os.hostname()}
🔹 Platform     : ${os.platform()} ${os.arch()}
🔹 OS Version   : ${os.version?.() || os.release()}
🔹 Node.js Ver  : ${process.version}
🔹 Time Now     : ${timeNow}

💻 CPU:
• Model         : ${cpus[0].model}
• Cores         : ${cpus.length}
• Speed         : ${cpus[0].speed} MHz

🧠 RAM:
• Total         : ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Used          : ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Free          : ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Usage         : ${memUsage}%

⏱ Uptime        : ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s

🌐 Network Info:
${networkInfo || "No active interface found."}

📶 Ping          : ${ping} ms`;

    return api.sendMessage(message, event.threadID, event.messageID);
  }
};