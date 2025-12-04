const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function download({ videoUrl, message, event }) {
  // New API URL for POST request
  const apiUrl = `https://neokex-dl-apis.fly.dev/download`;
  
  try {
    message.reply("Sending request to the download API...");

    // 1. Send POST request to the new API endpoint
    const apiResponse = await axios.post(apiUrl, 
      { url: videoUrl }, // Data payload with the URL
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    const videoData = apiResponse.data;

    // Check if the request was successful and contains the required data
    if (!videoData || !videoData.success || !videoData.data || !videoData.data.streamUrl) {
      throw new Error("API response failed or missing stream URL.");
    }
    
    // Updated: Get title and source (platform) from the 'data' object
    const { title, source, streamUrl } = videoData.data;
    const platform = source;

    // The stream URL is now streamUrl from the 'data' object
    const downloadUrl = streamUrl; 

    // 2. Download the video stream from the downloadUrl
    const videoStreamResponse = await axios({
      method: 'get',
      url: downloadUrl,
      responseType: 'stream'
    });
    
    const tempFilePath = path.join(__dirname, 'cache', `${Date.now()}_${title.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.mp4`);
    
    if (!fs.existsSync(path.join(__dirname, 'cache'))) {
        fs.mkdirSync(path.join(__dirname, 'cache'));
    }

    const writer = fs.createWriteStream(tempFilePath);
    videoStreamResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    message.reaction("✅", event.messageID);

    // Reply body as requested (no bolding)
    await message.reply({
      body: `Title: ${title}\nPlatform: ${platform}\nUrl: ${downloadUrl}`,
      attachment: fs.createReadStream(tempFilePath)
    });
    
    fs.unlinkSync(tempFilePath);

  } catch (error) {
    message.reaction("❌", event.messageID);
    console.error("Download Error:", error.message || error);
    message.reply("An error occurred during download. Please check the URL and try again.");
    const tempFilePath = path.join(__dirname, 'cache', `${Date.now()}_temp.mp4`); 
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
}

module.exports = {
  config: {
    name: "dl",
    aliases: ["download"],
    version: "2.0", // Major version update due to API change
    author: "Christus", 
    countDown: 5,
    role: 0,
    longDescription: "Download Videos from various Sources.",
    category: "media",
    guide: { en: { body: "{p}{n} [video link] or reply to a message containing a link." } }
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    let videoUrl = args.join(" ");
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    if ((args[0] === 'chat' && (args[1] === 'on' || args[1] === 'off')) || args[0] === 'on' || args[0] === 'off') {
      if (role >= 1) {
        const choice = args[0] === 'on' || args[1] === 'on';
        await threadsData.set(event.threadID, { data: { autoDownload: choice } });
        return message.reply(`Auto-download has been turned ${choice ? 'on' : 'off'} for this group.`);
      } else {
        return message.reply("You don't have permission to toggle auto-download.");
      }
    }

    if (!videoUrl) {
      if (event.messageReply && event.messageReply.body) {
        const foundURLs = event.messageReply.body.match(urlRegex);
        if (foundURLs && foundURLs.length > 0) {
          videoUrl = foundURLs[0];
        } 
      }
    }

    if (!videoUrl || !videoUrl.match(urlRegex)) {
      return message.reply("No valid URL found. Please provide a video link or reply to a message containing one.");
    }

    message.reaction("⏳", event.messageID);
    await download({ videoUrl, message, event });
  },

  onChat: async function({ event, message, threadsData }) {
    const threadData = await threadsData.get(event.threadID);
    if (!threadData.data.autoDownload || event.senderID === global.botID) return;

    try {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundURLs = event.body.match(urlRegex);

      if (foundURLs && foundURLs.length > 0) {
        const videoUrl = foundURLs[0];
        message.reaction("⏳", event.messageID); 
        await download({ videoUrl, message, event });
      }
    } catch (error) {
      
    }
  }
};