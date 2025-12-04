const axios = require('axios');
const validUrl = require('valid-url');
const fs = require('fs');
const path = require('path');
const ytSearch = require('yt-search');
const { v4: uuidv4 } = require('uuid');

const API_ENDPOINT = "https://shizuai.vercel.app/chat";
const CLEAR_ENDPOINT = "https://shizuai.vercel.app/chat/clear";
const YT_API = "http://65.109.80.126:20409/aryan/yx";

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// 📥 Téléchargement de fichier depuis une URL
const downloadFile = async (url, ext) => {
  const filePath = path.join(TMP_DIR, `${uuidv4()}.${ext}`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, Buffer.from(response.data));
  return filePath;
};

// ♻️ Réinitialiser la conversation IA
const resetConversation = async (api, event, message) => {
  api.setMessageReaction("♻️", event.messageID, () => {}, true);
  try {
    await axios.delete(`${CLEAR_ENDPOINT}/${event.senderID}`);
    return message.reply(`✅ Conversation reset for UID: ${event.senderID}`);
  } catch (error) {
    console.error('❌ Reset Error:', error.message);
    return message.reply("❌ Reset failed. Try again.");
  }
};

// 🎬 Fonction YouTube : recherche et téléchargement
const handleYouTube = async (api, event, message, args) => {
  const option = args[0];
  if (!["-v", "-a"].includes(option)) {
    return message.reply("❌ Usage: youtube [-v|-a] <search or URL>");
  }

  const query = args.slice(1).join(" ");
  if (!query) return message.reply("❌ Provide a search query or URL.");

  const sendFile = async (url, type) => {
    try {
      const { data } = await axios.get(`${YT_API}?url=${encodeURIComponent(url)}&type=${type}`);
      const downloadUrl = data.download_url;
      if (!data.status || !downloadUrl) throw new Error("API failed");
      const filePath = path.join(TMP_DIR, `yt_${Date.now()}.${type}`);
      const writer = fs.createWriteStream(filePath);
      const stream = await axios({ url: downloadUrl, responseType: "stream" });
      stream.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      await message.reply({ attachment: fs.createReadStream(filePath) });
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`${type} error:`, err.message);
      message.reply(`❌ Failed to download ${type}.`);
    }
  };

  if (query.startsWith("http")) return await sendFile(query, option === "-v" ? "mp4" : "mp3");

  try {
    const results = (await ytSearch(query)).videos.slice(0, 6);
    if (results.length === 0) return message.reply("❌ No results found.");

    let list = "";
    results.forEach((v, i) => {
      list += `${i + 1}. 🎬 ${v.title} (${v.timestamp})\n`;
    });

    const thumbs = await Promise.all(
      results.map(v => axios.get(v.thumbnail, { responseType: "stream" }).then(res => res.data))
    );

    api.sendMessage(
      { body: list + "\nReply with number (1-6) to download.", attachment: thumbs },
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ai",
          messageID: info.messageID,
          author: event.senderID,
          results,
          type: option
        });
      },
      event.messageID
    );
  } catch (err) {
    console.error("YouTube error:", err.message);
    message.reply("❌ Failed to search YouTube.");
  }
};

// 🧠 Fonction principale IA
const handleAIRequest = async (api, event, userInput, message, isReply = false) => {
  const args = userInput.split(" ");
  const first = args[0]?.toLowerCase();

  // 🔹 Si l'utilisateur demande YouTube
  if (["youtube", "yt", "ytb"].includes(first)) {
    return await handleYouTube(api, event, message, args.slice(1));
  }

  // 🔹 Sinon, traiter comme une requête IA
  const userId = event.senderID;
  let messageContent = userInput;
  let imageUrl = null;

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  const urlMatch = messageContent.match(/(https?:\/\/[^\s]+)/)?.[0];
  if (urlMatch && validUrl.isWebUri(urlMatch)) {
    imageUrl = urlMatch;
    messageContent = messageContent.replace(urlMatch, '').trim();
  }

  if (!messageContent && !imageUrl) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply("💬 Provide a message or image.");
  }

  try {
    const response = await axios.post(API_ENDPOINT, { uid: userId, message: messageContent, image_url: imageUrl });
    const { reply: textReply, image_url: genImageUrl } = response.data;

    let finalReply = textReply || '✅ AI Response:';
    // 🔹 Remplacer "Shizu" par "Christus"
    finalReply = finalReply
      .replace(/🎀\s*𝗦𝗵𝗶𝘇𝘂/gi, '🎀 𝗖𝗵𝗿𝗶𝘀𝘁𝘂𝘀')
      .replace(/Shizu/gi, 'Christus')
      .replace(/Aryan Chauhan/gi, 'Christus');

    const attachments = [];
    if (genImageUrl) {
      attachments.push(fs.createReadStream(await downloadFile(genImageUrl, 'jpg')));
    }

    const sentMessage = await message.reply({
      body: finalReply,
      attachment: attachments.length > 0 ? attachments : undefined
    });

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: 'ai',
      messageID: sentMessage.messageID,
      author: userId
    });

    api.setMessageReaction("✅", event.messageID, () => {}, true);
  } catch (error) {
    console.error("❌ API Error:", error.message);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    message.reply("⚠️ AI Error:\n" + error.message);
  }
};

module.exports = {
  config: {
    name: 'ai',
    version: '3.0.0',
    author: 'Christus',
    role: 0,
    category: 'ai',
    longDescription: { en: 'AI + YouTube: Chat, Images, Music, Video, Lyrics, YouTube Downloader' },
    guide: {
      en: `.ai [message] → chat with AI  
.ai youtube -v [query/url] → download video  
.ai youtube -a [query/url] → download audio  
.ai clear → reset conversation`
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const userInput = args.join(' ').trim();
    if (!userInput) return message.reply("❗ Please enter a message.");
    if (['clear', 'reset'].includes(userInput.toLowerCase())) {
      return await resetConversation(api, event, message);
    }
    return await handleAIRequest(api, event, userInput, message);
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;
    const userInput = event.body?.trim();
    if (!userInput) return;
    if (['clear', 'reset'].includes(userInput.toLowerCase())) {
      return await resetConversation(api, event, message);
    }
    if (Reply.results && Reply.type) {
      const idx = parseInt(userInput);
      const list = Reply.results;
      if (isNaN(idx) || idx < 1 || idx > list.length)
        return message.reply("❌ Invalid selection (1-6).");
      const selected = list[idx - 1];
      const type = Reply.type === "-v" ? "mp4" : "mp3";
      const fileUrl = `${YT_API}?url=${encodeURIComponent(selected.url)}&type=${type}`;
      try {
        const { data } = await axios.get(fileUrl);
        const downloadUrl = data.download_url;
        const filePath = await downloadFile(downloadUrl, type);
        await message.reply({ attachment: fs.createReadStream(filePath) });
        fs.unlinkSync(filePath);
      } catch {
        message.reply(`❌ Failed to download ${type}.`);
      }
    } else {
      return await handleAIRequest(api, event, userInput, message, true);
    }
  },

  onChat: async function ({ api, event, message }) {
    const body = event.body?.trim();
    if (!body?.toLowerCase().startsWith('ai ')) return;
    const userInput = body.slice(3).trim();
    if (!userInput) return;
    return await handleAIRequest(api, event, userInput, message);
  }
};