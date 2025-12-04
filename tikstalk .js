const axios = require("axios");

module.exports = {
  config: {
    name: "tikstalk",
    aliases: ["tiktokinfo"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Stalk a TikTok profile" },
    longDescription: { en: "Fetch TikTok profile details using Aryan API." },
    category: "social",
    guide: { en: "{pn} <tiktok-username>\n\nExample:\n{pn} tinkjarhusse" }
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) {
      return api.sendMessage("❌ Please provide a TikTok username.", event.threadID, event.messageID);
    }

    const username = args[0].replace("@", "");
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://aryanapi.up.railway.app/api/tikinfo?unique_id=${encodeURIComponent(username)}`;
      const { data } = await axios.get(url);

      if (!data.status || !data.data) {
        return api.sendMessage("❌ Could not fetch TikTok profile info.", event.threadID, event.messageID);
      }

      const u = data.data;
      const caption =
`🎵 TikTok Profile Stalk

👤 Nickname: ${u.nickname || "N/A"}
🔗 Username: @${u.uniqueId}
📝 Bio: ${u.signature || "No bio"}
✅ Verified: ${u.verified ? "Yes" : "No"}
🔒 Private Account: ${u.privateAccount ? "Yes" : "No"}

👥 Followers: ${u.followerCount}
➡ Following: ${u.followingCount}
❤ Likes: ${u.heartCount}
🎥 Videos: ${u.videoCount}

👀 Requested by: @${event.senderID}`;

      api.sendMessage({
        body: caption,
        attachment: await getStreamFromURL(u.avatarLarger || u.avatarMedium || u.avatarThumb)
      }, event.threadID, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error("❌ Tikstalk Error:", err.message);
      api.sendMessage("❌ Failed to fetch TikTok profile info.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

async function getStreamFromURL(url) {
  const res = await axios({ url, responseType: "stream" });
  return res.data;
}