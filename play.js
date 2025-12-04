const a = require("axios");
const b = require("fs");
const c = require("path");
const d = require("yt-search");

module.exports = {
  config: {
    name: "play",
    aliases: [],
    version: "0.0.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "play tomake chai",
    longDescription: "Search and download music from YouTube",
    category: "MUSIC",
    guide: "/play<song name or YouTube URL>"
  },

  onStart: async function ({ api: e, event: f, args: g }) {
    if (!g.length) return e.sendMessage("❌ Provide a song name or YouTube URL.", f.threadID, f.messageID);

    let h = g.join(" ");
    const i = await e.sendMessage("🎵 Please wait...", f.threadID, null, f.messageID);

    try {
      let j;
      if (h.startsWith("http")) {
        j = h;
      } else {
        const k = await d(h);
        if (!k || !k.videos.length) throw new Error("No results found.");
        j = k.videos[0].url;
      }

      const l = `http://65.109.80.126:20409/aryan/ytbv3?url=${encodeURIComponent(j)}&format=mp3`;
      const m = await a.get(l);
      const n = m.data;

      if (!n.status || !n.download) throw new Error("API failed to return download URL.");

      const o = `${n.title}.mp3`.replace(/[\\/:"*?<>|]/g, "");
      const p = c.join(__dirname, o);

      const q = await a.get(n.download, { responseType: "arraybuffer" });
      b.writeFileSync(p, q.data);

      await e.sendMessage(
        { attachment: b.createReadStream(p), body: `🦆 ${n.title}` },
        f.threadID,
        () => {
          b.unlinkSync(p);
          e.unsendMessage(i.messageID);
        },
        f.messageID
      );

    } catch (r) {
      console.error(r);
      e.sendMessage(`❌ Failed to download song: ${r.message}`, f.threadID, f.messageID);
      e.unsendMessage(i.messageID);
    }
  }
};