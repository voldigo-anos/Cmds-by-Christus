const axios = require('axios');

module.exports = {
  config: {
    name: "dl",
    aliases: [],
    version: "1.4",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Download and send video from URL"
    },
    description: {
      en: "Download video from a URL and send it in the chat."
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: "Use the command: !alldl <url> or reply to a message containing a link."
    }
  },

  onStart: async function ({ api, event, args }) {
    let videoURL = args.join(" ");
    
    if (!videoURL) {
      if (event.messageReply && event.messageReply.body) {
        const replyMessage = event.messageReply.body;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundURLs = replyMessage.match(urlRegex);
        if (foundURLs && foundURLs.length > 0) {
          videoURL = foundURLs[0];
        } else {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return api.sendMessage(
            "No URL found in the reply message.",
            event.threadID,
            event.messageID
          );
        }
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage(
          "Please provide a URL after the command or reply to a message containing a URL.",
          event.threadID,
          event.messageID
        );
      }
    }

    try {
      const apiData = await axios.get('https://raw.githubusercontent.com/romeoislamrasel/romeobot/refs/heads/main/api.json');
      const apiUrls = apiData.data; 
      const apiUrl = apiUrls.alldl; 

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await axios.get(`${apiUrl}/allLink`, {
        params: { link: videoURL },
      });

      if (response.status === 200 && response.data.download_url) {
        const { download_url: high, platform, video_title } = response.data;
        const stream = await global.utils.getStreamFromURL(high, "video.mp4");

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        api.sendMessage({
          body: `💁‍♂️ Here's your downloaded video!\n\nPlatform: ${platform}\nTitle: ${video_title}`,
          attachment: stream
        }, event.threadID, (err) => {
          if (err) {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            api.sendMessage("Failed to send the video.", event.threadID, event.messageID);
          }
        }, event.messageID);
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage(
          "Failed to retrieve the download URL. Please try again later.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "An error occurred while retrieving video details.",
        event.threadID,
        event.messageID
      );
    }
  },

  onChat: async function ({ api, event, message }) {
    const threadID = event.threadID;

    if (event.body && event.body.toLowerCase() === '!dl on') {
      global.autoDownloadStates[threadID] = 'on';
      return api.sendMessage("Auto-download is now **ON** for this thread.", threadID, event.messageID);
    } 
    if (event.body && event.body.toLowerCase() === '!dl off') {
      global.autoDownloadStates[threadID] = 'off';
      return api.sendMessage("Auto-download is now **OFF** for this thread.", threadID, event.messageID);
    }

    if (!global.autoDownloadStates) {
      global.autoDownloadStates = {};
    }

    if (global.autoDownloadStates[threadID] === undefined) {
      global.autoDownloadStates[threadID] = 'on';
    }

    if (global.autoDownloadStates[threadID] === 'off') return;

    const urlRegx = /https:\/\/(vt\.tiktok\.com|www\.tiktok\.com|www\.facebook\.com|www\.instagram\.com|youtu\.be|youtube\.com|x\.com|www\.instagram\.com\/p\/|pin\.it|twitter\.com|vm\.tiktok\.com|fb\.watch)[^\s]+/g;
    let videoURL = "";

    if (event.body) {
      const match = event.body.match(urlRegx);
      if (match) {
        videoURL = match[0];
      }
    } else if (event.messageReply && event.messageReply.body) {
      const replyMessage = event.messageReply.body;
      const foundURLs = replyMessage.match(urlRegx);
      if (foundURLs && foundURLs.length > 0) {
        videoURL = foundURLs[0];
      }
    }

    if (videoURL) {
      try {
        const apiData = await axios.get('https://raw.githubusercontent.com/romeoislamrasel/romeobot/refs/heads/main/api.json');
        const apiUrls = apiData.data;
        const apiUrl = apiUrls.alldl;

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const response = await axios.get(`${apiUrl}/allLink`, {
          params: { link: videoURL },
        });

        if (response.status === 200 && response.data.download_url) {
          const { download_url: high, platform, video_title } = response.data;
          const stream = await global.utils.getStreamFromURL(high, "video.mp4");

          api.setMessageReaction("✅", event.messageID, () => {}, true);

          api.sendMessage({
            body: `Here's your downloaded video!\n\nPlatform: ${platform}\nTitle: ${video_title}`,
            attachment: stream
          }, event.threadID, (err) => {}, event.messageID);
        } else {
          api.setMessageReaction("🚫", event.messageID, () => {}, true);
        }
      } catch (error) {
        api.setMessageReaction("🚫", event.messageID, () => {}, true);
      }
    }
  }
};