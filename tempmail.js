const axios = require("axios");

module.exports = {
  config: {
    name: "tempmail",
    aliases: ["tm"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get temporary email" },
    longDescription: { en: "Generate temp email & check inbox" },
    category: "tools",
    guide: { en: "{p}tempmail [inbox <email>]" }
  },

  onStart: async ({ api, event, args }) => {
    if (args[0] === "inbox" && args[1]) {
      try {
        const r = await axios.get("https://aryanapi.up.railway.app/api/tempmailcoolinbox", {
          params: { email: args[1] }
        });
        const d = r.data;
        if (!d || Object.keys(d).length <= 1)
          return api.sendMessage("📭 Inbox empty.", event.threadID, event.messageID);

        let msg = "📬 TempMail Inbox:\n\n";
        for (const k in d) {
          if (k === "operator") continue;
          const m = d[k];
          msg += `✉ From: ${m.sender} <${m.send_from}>\n📌 Subject: ${m.subject}\n🕒 ${m.created_at}\n📖 ${m.text || "(no text)"}\n\n`;
        }
        api.sendMessage(msg.trim(), event.threadID, event.messageID);
      } catch (e) {
        api.sendMessage("❌ Error fetching inbox.", event.threadID, event.messageID);
      }
    } else {
      try {
        const r = await axios.get("https://aryanapi.up.railway.app/api/tempmailcool");
        api.sendMessage(`📧 Your TempMail:\n${r.data.email}`, event.threadID, event.messageID);
      } catch (e) {
        api.sendMessage("❌ Error generating tempmail.", event.threadID, event.messageID);
      }
    }
  }
};