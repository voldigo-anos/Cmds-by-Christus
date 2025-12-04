const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fbcover",
    version: "0.1.0",
    author: "Christus",
    role: 0,
    shortDescription: "Generate Facebook Cover",
    longDescription: "Create Facebook Cover using your details",
    category: "image",
    guide: {
      en: "-fbcover Name | Subname | Email | Phone | Address | Color"
    }
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ").split("|").map(item => item.trim());

    if (input.length < 6) {
      return message.reply("❌ Please provide all 6 fields:\nName | Subname | Email | Phone | Address | Color");
    }

    const [name, subname, email, phoneNumber, address, color] = input;
    const uid = event.senderID;

    const waitMsg = await message.reply("🖼 Generating your Facebook cover...");

    try {
      const boldApi = "http://65.109.80.126:20409/aryan/font?style=bold";
      const [
        boldName,
        boldEmail,
        boldPhone,
        boldAddress,
        boldColor
      ] = await Promise.all([
        axios.get(`${boldApi}&text=${encodeURIComponent(name)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(email)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(phoneNumber)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(address)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(color)}`)
      ]);

      const apiUrl = `http://65.109.80.126:20409/aryan/fbcover?name=${encodeURIComponent(name)}&uid=${uid}&subname=${encodeURIComponent(subname)}&email=${encodeURIComponent(email)}&phoneNumber=${encodeURIComponent(phoneNumber)}&address=${encodeURIComponent(address)}&color=${encodeURIComponent(color)}`;

      const imgBuffer = (await axios.get(apiUrl, { responseType: "arraybuffer" })).data;

      const fileName = `fbcover-${Date.now()}.png`;
      const filePath = path.join(__dirname, "cache", fileName);
      fs.writeFileSync(filePath, Buffer.from(imgBuffer, "utf-8"));

      await message.reply({
        body:
`✅ Facebook Cover Created!

👤 Name: ${boldName.data.result}
📧 Email: ${boldEmail.data.result}
📱 Phone: ${boldPhone.data.result}
📍 Address: ${boldAddress.data.result}
🎨 Color: ${boldColor.data.result}`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(err);
      message.reply("❌ Error generating Facebook cover. Please try again later.");
    }

    if (waitMsg) {
      message.unsend(waitMsg.messageID);
    }
  }
};