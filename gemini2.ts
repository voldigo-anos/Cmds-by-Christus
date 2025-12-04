/*
 * @XaviaCMD
 * @rapido
 **/

import axios from "axios";

const config = {
  name: "gemini",
  version: "2.1.0",
  permissions: [0],
  noPrefix: "both",
  credits: "christus",
  description:
    "Interact with Google Gemini 2.0 Flash with Image recognition (From Christus's Bot command). Updated to use NekoLabs Gemini 2.0 Flash API.",
  category: "AI",
  usages: "[text] (reply to image)",
  cooldown: 3,
};

const style = {
  titleFont: "bold",
  title: "📷 Google Gemini 2.0 Flash",
  contentFont: "fancy",
};

async function onCall({ message, args, getLang }) {
  const text = args.join(" ");
  if (!text)
    return message.reply(
      "Please provide a question or reply to photo/image to recognize it with question."
    );

  try {
    let imageUrl;
    if (message.messageReply?.attachments?.[0]?.type === "photo") {
      imageUrl = message.messageReply.attachments[0].url;
    }

    const systemPrompt = "You are a helpful assistant";

    const api = `https://api.nekolabs.web.id/ai/gemini/2.0-flash/v1?text=${encodeURIComponent(
      text
    )}&systemPrompt=${encodeURIComponent(systemPrompt)}${
      imageUrl ? `&imageUrl=${encodeURIComponent(imageUrl)}` : ""
    }`;

    const res = await axios.get(api);

    if (!res.data?.result) {
      return message.reply("⚠️ No response received from Gemini 2.0 Flash API.");
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