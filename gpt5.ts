import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "gpt5",
  meta: {
    otherNames: ["gpt-5", "neko-gpt5", "ai-gpt5"],
    author: "Christus",
    description: "Chat with NekoLabs GPT-5 assistant.",
    icon: "🤖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "🤖 GPT-5 NekoLabs",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  style: {
    title: { color: "#9B30FF", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#444444" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface GPT5ResponseType {
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
  const ask = args.join(" ");

  await output.reaction("🟣"); // CHARGEMENT unique

  if (!ask) {
    cancelCooldown();
    await output.reaction("⚠️"); // ERREUR unique
    return output.reply(
      `❓ Please type a message for **GPT-5**.\n\nExample: ${prefix}${commandName} Hello GPT-5`
    );
  }

  try {
    const systemPrompt = "You are a helpful assistant";

    const apiURL =
      `https://api.nekolabs.web.id/ai/gpt/5?text=${encodeURIComponent(
        ask
      )}&systemPrompt=${encodeURIComponent(systemPrompt)}`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<GPT5ResponseType> = await axios.get(apiURL, {
      headers,
      timeout: 35_000,
    });

    const answer =
      res.data?.result || "⚠️ No response received from GPT-5 API.";

    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━\n` +
        `🤖 **GPT-5 NekoLabs**\n\n` +
        `${answer}\n\n` +
        `――――――――――――\n` +
        `💬 ***Reply to continue the conversation.***\n` +
        `━━━━━━━━━━━━━━`,
    };

    await output.reaction("✅"); // SUCCÈS unique

    const info = await output.reply(form);

    // Conversation continue
    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("GPT-5 API error:", err?.message || err);

    await output.reaction("⚠️"); // ERREUR unique
    cancelCooldown();

    return output.reply(
      `❗ **API Error**\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;