import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "deepseek",
  meta: {
    otherNames: ["ds2", "askds2", "seekai2"],
    author: "Christus Dev AI",
    description:
      "Talk with DeepSeek 2 — a smart AI assistant from Christus Bot.",
    icon: "🤖",
    version: "1.6.0",
    noPrefix: "both",
  },
  title: {
    content: "DeepSeek 2 AI 💡",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface ResponseType {
  status: boolean;
  result?: string;
}

async function main({
  output,
  args,
  commandName,
  prefix,
  input,
  cancelCooldown,
}: CommandContext) {
  const ask = args.join(" ");
  await output.reaction("🕐");

  if (!ask) {
    cancelCooldown();
    await output.reaction("❌");
    return output.reply(
      `💬 Please enter a message for **DeepSeek 2**.\n\nExample: ${prefix}${commandName} How does AI work?`
    );
  }

  try {
    const apiURL = `https://arychauhann.onrender.com/api/deepseek2?prompt=${encodeURIComponent(
      ask
    )}&model=1`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<ResponseType> = await axios.get(apiURL, {
      headers,
      timeout: 25_000,
    });

    const answer =
      res.data?.result?.trim() || "⚠️ No response received from DeepSeek 2.";

    const form: StrictOutputForm = {
      body: `🤖 **Christus DeepSeek 2 **\n\n${answer}\n\n***Reply to continue the conversation.***`,
    };

    await output.reaction("✅");
    const info = await output.reply(form);

    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("Error calling DeepSeek 2 API:", err?.message || err);
    await output.reaction("⚠️");
    cancelCooldown();
    return output.reply(
      `❗ **API connection error**\n\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;