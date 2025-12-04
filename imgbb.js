const axios = require("axios");

module.exports = {
  config: {
    name: "imgbb",
    version: "1.0.0",
    author: "Christus x Merdi",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image/video to ImgBB",
    longDescription: "Reply to an image or provide a URL to upload it to ImgBB.",
    category: "utility",
    guide: "{pn} reply to an image or provide a URL"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    let mediaUrl = "";

    if (messageReply && messageReply.attachments.length > 0) {
      mediaUrl = messageReply.attachments[0].url;
    } else if (args.length > 0) {
      mediaUrl = args.join(" ");
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Please reply to an image or provide a URL!", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(`http://65.109.80.126:20409/aryan/imgbb?url=${encodeURIComponent(mediaUrl)}`);
      const imgbbLink = res.data.link;

      if (!imgbbLink) {
        api.setMessageReaction("", messageID, () => {}, true);
        return api.sendMessage("❌ Failed to upload to ImgBB.", threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`${imgbbLink}`, threadID, messageID);

    } catch (err) {
      console.error("ImgBB upload error:", err);
      api.setMessageReaction("", messageID, () => {}, true);
      return api.sendMessage("⚠ An error occurred while uploading.", threadID, messageID);
    }
  }
};