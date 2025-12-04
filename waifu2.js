const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const axios = require("axios");

module.exports = {
  config: {
    name: "waifu2",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Send safe cute anime illustration" },
    longDescription: { en: "Fetches safe (non-R18) anime images from lolicon API" },
    category: "fun",
    guide: { en: "+waifu2" }
  },

  onStart: async function({ message }) {
    try {
      const res = await axios.post("https://api.lolicon.app/setu/v2", {
        r18: 0,
        num: 1
      });

      if (!res.data || !res.data.data || res.data.data.length === 0) {
        return message.reply("❌");
      }

      const imageUrl = res.data.data[0].urls.original || res.data.data[0].urls.regular;
      const filePath = path.join(__dirname, "cache/hentai.jpg");

      const file = fs.createWriteStream(filePath);
      https.get(imageUrl, resImg => {
        resImg.pipe(file);
        file.on("finish", () => {
          const caption = `
✨ 𝓒𝓾𝓽𝓮 𝓗𝓮𝓷𝓽𝓪𝓲 𝓑𝓪𝓫𝔂 ✨

🌸 𝐀𝐩𝐢 𝐂𝐫𝐞𝐝𝐢𝐭: 𝐶𝐻𝑅𝐼𝑆𝑇𝑈𝑆
          `;
          message.reply({
            body: caption.trim(),
            attachment: fs.createReadStream(filePath)
          });
        });
      }).on("error", () => {
        message.reply("❌");
      });

    } catch {
      message.reply("❌";
    }
  }
};