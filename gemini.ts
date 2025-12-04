/*
@XaviaCMD
@Christus
*/

import axios from "axios";

const config = {
  name: "gemini",
  version: "2.2.1",
  permissions: [0],
  noPrefix: "both",
  credits: "Christus",
  description: "Interact with Christus Bot AI via Aryan Chauhan’s API Proxy",
  category: "Artificial Intelligence",
  usages: "[text]",
  cooldown: 3
};

const style = {
  titleFont: "bold",
  title: "🇨🇮 𝗖𝗵𝗿𝗶𝘀𝘁𝘂𝘀 𝗕𝗼𝘁 🇨🇮",
  contentFont: "fancy"
};

async function onCall({ message, args }) {
  const text = args.join(" ");
  if (!text)
    return message.reply("❌ Please provide a question or message for Christus Bot to answer.");

  try {
    const url = `https://arychauhann.onrender.com/api/gemini-proxy2?prompt=${encodeURIComponent(text)}`;
    const res = await axios.get(url, { headers: { "Content-Type": "application/json" } });

    if (!res.data || !res.data.result) {
      return message.reply("⚠️ No response received from the Christus Bot AI. Please try again later.");
    }

    const response = res.data.result.trim();

    const formattedMessage = 
`━━━━━━━━━━━━━━━
${style.title}
━━━━━━━━━━━━━━━
💬 𝗬𝗼𝘂 𝗮𝘀𝗸𝗲𝗱: ${text}
💡 𝗖𝗵𝗿𝗶𝘀𝘁𝘂𝘀 𝗴𝗲𝗺𝗶𝗻𝗶 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲: ${response}
━━━━━━━ ✕ ━━━━━━`;

    message.reply(formattedMessage);

  } catch (err) {
    message.reply(`❌ An error occurred while fetching data:\n${err.message}`);
  }
}

export default {
  config,
  onCall,
  style
};