const axios = require("axios");

module.exports = {
  config: {
    name: "instastalk",
    aliases: ["igstalk"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Stalk an Instagram profile" },
    longDescription: { en: "Fetches Instagram profile details (public) using Aryan API." },
    category: "social",
    guide: { en: "{pn} <username>\n\nExample:\n{pn} arychauhann" }
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) return api.sendMessage("❌ Please provide an Instagram username.", event.threadID, event.messageID);

    const username = args[0].replace("@", "");
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://aryanapi.up.railway.app/api/instastalk?query=${encodeURIComponent(username)}`;
      const { data } = await axios.get(url);

      if (!data.status || !data.result) {
        return api.sendMessage("❌ Could not fetch profile info.", event.threadID, event.messageID);
      }

      const result = data.result;
      const caption = 
`📸 Instagram Profile Stalk

👤 Full Name: ${result.fullName || "N/A"}
🔗 Username: ${result.username}
📝 Bio: ${result.bio || "No bio"}
✅ Verified: ${result.isVerified ? "Yes" : "No"}

👥 Followers: ${result.followers}
📂 Uploads: ${result.uploads}
📊 Engagement: ${result.engagement}

👀 Requested by: @${event.senderID}`;

      api.sendMessage({
        body: caption,
        attachment: await getStreamFromURL(result.profileImage)
      }, event.threadID, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error("❌ Instastalk Error:", err.message);
      api.sendMessage("❌ Failed to fetch Instagram profile info.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

async function getStreamFromURL(url) {
  const axios = require("axios");
  const res = await axios({ url, responseType: "stream" });
  return res.data;
}