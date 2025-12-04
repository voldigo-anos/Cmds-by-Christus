const f = require("node-fetch");
const a = require("axios");
const b = require("fs");
const c = require("path");
const d = require("yt-search");

module.exports = {
  config: {
    name: "video",
    aliases: ["v"],
    version: "0.0.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "Search and download YouTube video",
    longDescription: "Searches YouTube and sends the top video with stats",
    category: "MUSIC",
    guide: "/video [video name]"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) return api.sendMessage("Please provide a video name.", event.threadID, event.messageID);

    const aryan = args.join(" ");
    const msg = await api.sendMessage("🎧 Please wait...", event.threadID, null, event.messageID);

    try {
      const r = await d(aryan);
      if (!r || !r.videos.length) throw new Error("No video found.");

      const v = r.videos[0];
      const u = v.url;

      const link = `http://65.109.80.126:20409/aryan/ytbv3?url=${encodeURIComponent(u)}&format=mp4`;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const dl = await a.get(link);
      const dlUrl = dl.data.download;

      const res = await f(dlUrl);
      if (!res.ok) throw new Error(`Failed to fetch video. Status code: ${res.status}`);

      const file = `${v.title}.mp4`;
      const save = c.join(__dirname, file);

      const buff = await res.buffer();
      b.writeFileSync(save, buff);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const text = `📌 Title: ${v.title}\n👀 Views: ${v.views}`;

      await api.sendMessage(
        { attachment: b.createReadStream(save), body: text },
        event.threadID,
        () => {
          b.unlinkSync(save);
          api.unsendMessage(msg.messageID);
        },
        event.messageID
      );
    } catch (e) {
      console.error(`Failed to download video: ${e.message}`);
      api.sendMessage(`Failed to download video: ${e.message}`, event.threadID, event.messageID);
    }
  },
};