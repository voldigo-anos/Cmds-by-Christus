const axios = require("axios");

module.exports = {
  config: {
    name: "vedit",
    version: "0.0.1",
    author: "Christus",
    category: "fun",
    role: 0,
    shortDescription: "Turn photo into short AI animation video."
  },

  onStart: async function ({ api: a, event: e, args: t }) {
    const f = t.join(" ");
    if (!f)
      return a.sendMessage("❌ Please provide a prompt!\nExample: animate anime girl dancing", e.threadID, e.messageID);

    let p = f;
    let d = 5;
    const m = f.match(/\|\s*(\d+)s?/i);
    if (m) {
      d = parseInt(m[1]);
      p = f.replace(/\|\s*\d+s?/i, "").trim();
    }

    if (
      !e.messageReply ||
      !e.messageReply.attachments ||
      e.messageReply.attachments.length === 0 ||
      e.messageReply.attachments[0].type !== "photo"
    ) {
      return a.sendMessage("❌ Please reply to a photo with this command!", e.threadID, e.messageID);
    }

    const u = e.messageReply.attachments[0].url;
    a.sendMessage("🎬 Generating animation, please wait...", e.threadID, e.messageID);

    try {
      const apiUrl = `http://65.109.80.126:20409/aryan/aniedit?image_url=${encodeURIComponent(u)}&prompt=${encodeURIComponent(p)}&duration=${d}`;
      const { data: s } = await axios.get(apiUrl, { timeout: 120000 });

      if (!s.status || !s.video_url) throw new Error(s.message || "Failed to get video URL.");

      const v = s.video_url;
      const { data: c } = await axios.get(v, { responseType: "stream", timeout: 60000 });

      a.sendMessage(
        {
          body: `✅ Done!\n📝 Prompt: ${p}\n🕒 Duration: ${d}s`,
          attachment: c
        },
        e.threadID,
        e.messageID
      );
    } catch (err) {
      let msg = "❌ Failed to generate animation!";
      if (err.response?.data?.message) msg += `\nAPI Error: ${err.response.data.message}`;
      else if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT")
        msg = "❌ Animation generation timed out. Please try again.";
      a.sendMessage(msg, e.threadID, e.messageID);
    }
  }
};