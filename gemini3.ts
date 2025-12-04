/*
 * @XaviaCMD
 * @rapido
 **/

import axios from "axios";

const config = {
  name: "gemini",
  version: "2.2.0",
  permissions: [0],
  noPrefix: "both",
  credits: "Christus",
  description:
    "Interact with AI4Chat assistant. Updated Gemini cmd to use NekoLabs AI4Chat API.",
  category: "AI",
  usages: "[text] (reply to image)",
  cooldown: 3,
};

const style = {
  titleFont: "bold",
  title: "📷 Gemini AI4Chat",
  contentFont: "fancy",
};

async function onCall({ message, args, getLang }) {
  const text = args.join(" ");
  if (!text)
    return message.reply(
      "Please provide a question or reply to a photo/image to interact with AI4Chat."
    );

  try {
    let imageUrl;
    if (message.messageReply?.attachments?.[0]?.type === "photo") {
      imageUrl = message.messageReply.attachments[0].url;
    }

    // Construction de l'API
    const api = `https://api.nekolabs.web.id/ai/ai4chat/chat?text=${encodeURIComponent(
      text
    )}${imageUrl ? `&imageUrl=${encodeURIComponent(imageUrl)}` : ""}`;

    const res = await axios.get(api);

    if (!res.data?.result) {
      return message.reply("⚠️ No response received from AI4Chat API.");
    }

    message.reply(res.data.result);
  } catch (e: any) {
    message.reply(
      `An error occurred while fetching data: ${e.message}\nPlease contact admin of bot for assistance.`
    );
  }
}

export default {
  config,
  onCall,
  style,
};