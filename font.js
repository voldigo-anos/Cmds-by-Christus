const ax = require("axios");
const apiUrl = "http://65.109.80.126:20409/aryan/font";

module.exports = {
  config: {
    name: "font",
    aliases: ["ft"],
    version: "0.0.3",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: "Stylish text generator",
    longDescription: "Generate stylish text with different font styles.",
    guide: {
      en: "{p}font list\n{p}font <number> <text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage(
        "❌ | Please provide arguments.\nUse:\nfont list\nfont <number> <text>",
        event.threadID,
        event.messageID
      );
    }

    let styles = [];
    try {
      const r = await ax.get(apiUrl);
      styles = r.data.available_styles || [];
    } catch {
      return api.sendMessage("❌ | Failed to fetch font styles from API.", event.threadID, event.messageID);
    }

    if (args[0].toLowerCase() === "list") {
      let msg = "📜 | Available Font Styles:\n\n";
      styles.forEach((style, i) => {
        msg += `${i + 1}. ${style}\n`;
      });
      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (!err) setTimeout(() => api.unsendMessage(info.messageID), 15000);
      }, event.messageID);
    }

    const index = parseInt(args[0]);
    if (isNaN(index) || index < 1 || index > styles.length) {
      return api.sendMessage("❌ | Invalid style number.\nType: font list", event.threadID, event.messageID);
    }

    const style = styles[index - 1];
    const text = args.slice(1).join(" ");
    if (!text) return api.sendMessage("❌ | Please provide text to style.", event.threadID, event.messageID);

    try {
      const url = `${apiUrl}?style=${style}&text=${encodeURIComponent(text)}`;
      const r = await ax.get(url);
      const styledText = r.data.result || "❌ API error.";
      return api.sendMessage(styledText, event.threadID, event.messageID);
    } catch {
      return api.sendMessage("❌ | Failed to fetch styled text.", event.threadID, event.messageID);
    }
  }
};