import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "copilot",
  meta: {
    otherNames: ["co", "askco", "neko"],
    author: "Christus",
    description: "AI conversational system powered by NekoLabs Copilot API.",
    icon: "🌬️",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "🌬️ NekoLabs Copilot",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  style: {
    title: { color: "#00E0FF", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#444444" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface CopilotAPIResponse {
  success: boolean;
  result?: {
    text?: string;
    citations?: any[];
  };
}

async function main({ output, args, input, commandName, prefix, cancelCooldown }: CommandContext) {
  let ask = args.join(" ");
  await output.reaction("🌚");

  if (!ask) {
    cancelCooldown();
    await output.reaction("😡");
    return output.reply(
      `❓ Please provide a message.\n\nExample: ${prefix}${commandName} Hello Copilot!`
    );
  }

  try {
    const apiURL = `https://api.nekolabs.web.id/ai/copilot?text=${encodeURIComponent(ask)}`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<CopilotAPIResponse> = await axios.get(apiURL, {
      headers,
      timeout: 20_000,
    });

    const replyText =
      res.data?.result?.text || "⚠️ No response received from Copilot API.";

    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━\n` +
        `🤖 **NekoLabs Copilot**\n\n` +
        `${replyText}\n\n` +
        `――――――――――――\n` +
        `💬 ***Reply to continue the conversation.***\n` +
        `━━━━━━━━━━━━━━`,
    };

    await output.reaction("🤓");

    const msg = await output.reply(form);

    // 📌 Conversation continue
    msg.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("Copilot API error:", err?.message || err);

    await output.reaction("😡");
    cancelCooldown();

    return output.reply(
      `❗ **API Error**\n\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;