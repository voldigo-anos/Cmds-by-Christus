const axios = require("axios");

module.exports = {
  config: {
    name: "cdp",
    aliases: ["coupledp"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "Random Couple DP",
    longDescription: "Send random couple DP",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://xsaim8x-xxx-api.onrender.com/api/cdp2");
      const { boy, girl } = res.data;

      api.sendMessage(
        {
          body: "𝐯𝐨𝐢𝐜𝐢 𝐭𝐨𝐧 𝐜𝐝𝐩! ✨️",
          attachment: await Promise.all([
            global.utils.getStreamFromURL(boy),
            global.utils.getStreamFromURL(girl)
          ])
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Couldn't fetch Couple DP.", event.threadID, event.messageID);
      console.error(e);
    }
  }
};