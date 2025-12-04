import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "o3",
  meta: {
    otherNames: ["o3-mini", "ai-o3", "nekoo3"],
    author: "Christus",
    description: "Chat with NekoLabs OpenAI O3-Mini assistant.",
    icon: "🤖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "🤖 NekoLabs OpenAI O3-Mini",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  style: {
    title: { color: "#00FFAA", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#444444" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface O3MiniResponseType {
  success: boolean;
  result?: string;
}

async function main({
  output,
  args,
  input,
  commandName,
  prefix,
  cancelCooldown,
}: CommandContext) {
  let ask = args.join(" ");

  await output.reaction("🔄"); // CHARGEMENT unique

  if (!ask) {
    cancelCooldown();
    await output.reaction("⚠️"); // ERREUR unique
    return output.reply(
      `❓ Please type a message for **OpenAI O3-Mini**.\n\nExample: ${prefix}${commandName} Hello O3-Mini`
    );
  }

  try {
    const systemPrompt = "You are a helpful assistant";

    const apiURL =
      `https://api.nekolabs.web.id/ai/openai/o3-mini?` +
      `text=${encodeURIComponent(ask)}&systemPrompt=${encodeURIComponent(systemPrompt)}`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<O3MiniResponseType> = await axios.get(apiURL, {
      headers,
      timeout: 25_000,
    });

    const answer =
      res.data?.result || "⚠️ No response received from OpenAI O3-Mini API.";

    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━\n` +
        `🤖 **NekoLabs OpenAI O3-Mini**\n\n` +
        `${answer}\n\n` +
        `――――――――――――\n` +
        `💬 ***Reply to continue the conversation.***\n` +
        `━━━━━━━━━━━━━━`,
    };

    await output.reaction("✨"); // SUCCÈS unique

    const info = await output.reply(form);

    // Conversation continue
    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("O3-Mini API error:", err?.message || err);

    await output.reaction("⚠️"); // ERREUR unique
    cancelCooldown();

    return output.reply(
      `❗ **API Error**\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;