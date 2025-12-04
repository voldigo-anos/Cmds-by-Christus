const axios = require("axios");
const fs = require("fs");
const path = require("path");


module.exports = {
  config: {
    name: "tiktok",
    version: "0.0.1",
    role: 0,
    countDown: 0,
    author: "Christus x Aesther",
    shortDescription: "tiktok search videos",
    hasPrefix: false,
    category: "VIDEO",
    aliases: ["tik"],
    usage: "[Tiktok <search>]",
    cooldown: 5,
  },


  onStart: async function ({ api, event, args }) {
    try {
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
      const searchQuery = args.join(" ");
      if (!searchQuery) {
        api.sendMessage("Usage: tiktok <search text>", event.threadID);
        return;
      }


      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }


      const response = await axios.get(
        `https://aryanx-apisx.onrender.com/aryan/tiksearch?search=${encodeURIComponent(
          searchQuery
        )}`
      );


      const videos = response.data.data?.videos;
      if (!videos || !Array.isArray(videos) || videos.length === 0) {
        api.sendMessage(
          "No videos found for the given search query.",
          event.threadID
        );
        return;
      }


      const videoData = videos[0];
      const videoUrl = videoData.play;
      if (!videoUrl) {
        api.sendMessage("No playable video URL found.", event.threadID);
        return;
      }


      const message = `
      🎵𝗧𝗜𝗞𝗧𝗢𝗞 🎵      


👤𝗔𝘂𝘁𝗵𝗼𝗿:  *${videoData.author.nickname}*
🆔𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲:  @${videoData.author.unique_id}`;


      api.setMessageReaction("✅", event.messageID, () => {}, true);


      const filePath = path.join(cacheDir, `tiktok_video.mp4`);
      const writer = fs.createWriteStream(filePath);


      const videoResponse = await axios({
        method: "get",
        url: videoUrl,
        responseType: "stream",
      });


      videoResponse.data.pipe(writer);


      writer.on("finish", () => {
        api.sendMessage(
          { body: message, attachment: fs.createReadStream(filePath) },
          event.threadID,
          () => fs.unlinkSync(filePath)
        );
      });


      writer.on("error", () => {
        api.sendMessage("Failed to download the video.", event.threadID);
      });
    } catch (error) {
      api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
  },
};