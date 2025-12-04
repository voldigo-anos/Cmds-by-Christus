const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "love",
    version: "1.3",
    author: "Christus x Aesther",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Create a love ship image of two users"
    },
    description: {
      en: "Generates a cute ship image between two user avatars with love percentage and reaction"
    },
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
    guide: {
      en: "{p}love @user\nExample: {p}love @alice"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { mentions, senderID } = event;

    const mentionIDs = Object.keys(mentions);
    if (mentionIDs.length < 1) {
      return message.reply("❌ | Please mention a user to love with. Example:\n+love @user");
    }

    const uid1 = senderID;
    const uid2 = mentionIDs[0];

    // Fetch user names
    let name1 = "You";
    let name2 = mentions[uid2] || "User";

    try {
      const user1Data = await api.getUserInfo(uid1);
      const user2Data = await api.getUserInfo(uid2);

      name1 = user1Data[uid1].name;
      name2 = user2Data[uid2].name;
    } catch (err) {
      console.error("Failed to fetch user names:", err);
    }

    // Random love percentage
    const lovePercent = Math.floor(Math.random() * 91) + 10;

    // Reaction based on percentage
    let reaction = "";
    if (lovePercent >= 80) reaction = "💖 Perfect Match! 💖";
    else if (lovePercent >= 50) reaction = "💘 Good Match! 💘";
    else reaction = "💔 Needs some love... 💔";

    // Profile picture URLs
    const avatar1 = `https://graph.facebook.com/${uid1}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
    const avatar2 = `https://graph.facebook.com/${uid2}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    try {
      const res = await axios.get(`https://api.popcat.xyz/v2/ship?user1=${encodeURIComponent(avatar1)}&user2=${encodeURIComponent(avatar2)}`, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, "cache", `ship_${uid1}_${uid2}_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      const bodyMessage = `💞 Love Meter 💞\n\n${name1} ❤ ${name2}\nLove Percentage: ${lovePercent}%\n${reaction}`;

      message.reply({
        body: bodyMessage,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("❌ | Failed to generate love image. Try again later.");
    }
  }
};