const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "shoti",
    version: "1.2",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Fetch a random Shoti video.",
    },
    longDescription: {
      en: "Fetches a random short video from a new API and sends it to the chat.",
    },
    category: "media",
    guide: {
      en: "Use this command to fetch and share a random short video.",
    },
  },

  onStart: async function ({ api, event }) {
    const videoDir = path.join(__dirname, "cache");
    const videoPath = path.join(videoDir, `shoti_${Date.now()}.mp4`);
    const apiUrl = "https://apis-top.vercel.app/aryan/shoti";

    try {
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir);
      }

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.videoUrl) {
        return api.sendMessage("❌ Failed to fetch Shoti video. The API might be down or returned an invalid response.", event.threadID, event.messageID);
      }

      const { videoUrl, title, username, nickname, region } = data;

      const videoRes = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const writer = fs.createWriteStream(videoPath);

      videoRes.data.pipe(writer);

      writer.on("finish", () => {
        const caption = `🎀 𝗦𝗵𝗼𝘁𝗶\n━━━━━━━━━━\n📝 Title: ${title || "No title"}\n👤 Username: ${username || "N/A"}\n💬 Nickname: ${nickname || "N/A"}\n🌍 Region: ${region || "Unknown"}`;
        
        api.sendMessage(
          { body: caption, attachment: fs.createReadStream(videoPath) },
          event.threadID,
          () => fs.unlinkSync(videoPath),
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error("❌ Error writing video file:", err);
        api.sendMessage("❌ Error saving the video file.", event.threadID, event.messageID);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      });

    } catch (err) {
      console.error("❌ Error:", err.message);
      api.sendMessage("❌ An unexpected error occurred while fetching the Shoti video. Please try again later.", event.threadID, event.messageID);
    }
  },
};