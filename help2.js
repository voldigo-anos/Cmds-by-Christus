const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { commands, aliases } = global.GoatBot;
const { getPrefix } = global.utils;

const localImageDir = path.join(__dirname, "cache");
const localImagePath = path.join(localImageDir, "help.jpg");
const imageUrl = "https://i.imgur.com/k88KSuA.jpeg";

async function ensureImageCached() {
  if (!fs.existsSync(localImagePath)) {
    try {
      const res = await axios.get(imageUrl, { responseType: "stream" });
      await fs.ensureDir(localImageDir);
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(localImagePath);
        res.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (err) {
      console.error("[Help] Failed to cache image:", err.message);
    }
  }
}

function roleTextToString(role) {
  switch (role) {
    case 0: return "0 (All Users)";
    case 1: return "1 (Group Admins)";
    case 2: return "2 (Vip User)";
    case 3: return "3 (Bot Admin)";
    case 4: return "4 (Bot Developer)";
    default: return `${role} (Unknown)`;
  }
}

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "Christus",
    role: 0,
    shortDescription: { en: "Show command list or help info" },
    longDescription: { en: "Show full list or specific command details." },
    category: "info",
    guide: { en: "{pn} [command | -c category]" },
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const threadID = event.threadID;
    const prefix = await getPrefix(threadID);
    const argLower = args.map(i => i.toLowerCase());

    await ensureImageCached();

    const header = `╔═════ ❖ ≡ ❖ ═════╗\n   𝑪𝑯𝑹𝑰𝑺𝑻𝑼𝑺 𝑯𝙀𝙇𝙋 𝙈𝙀𝙉𝙐\n╚═════ ❖ ≡ ❖ ═════╝\n`;

    // /help -c <category>
    if (argLower[0] === "-c" && args.length > 1) {
      const inputRaw = args.slice(1).join(" ");
      const normalizedInput = inputRaw.toLowerCase().replace(/[-_]/g, " ").trim();

      const matchedCmds = [];

      for (const [name, cmd] of commands) {
        const rawCat = cmd.config.category || "Uncategorized";
        const normalizedCat = rawCat.toLowerCase().replace(/[-_]/g, " ").trim();
        if (normalizedCat === normalizedInput && cmd.config.role <= role) {
          matchedCmds.push(name);
        }
      }

      if (matchedCmds.length === 0) {
        return message.reply(`❌ No commands found for exact category "${inputRaw}".`);
      }

      const msg =
`${header}
✦━━━━━━━━━━━━━✦
❍ CATEGORY: ${inputRaw.toUpperCase()}
✦━━━━━━━━━━━━━✦
${matchedCmds.sort().map(name => `┋❍ ${name}`).join("\n")}
┕━━━━━━━━━━━━━━✦

Total: ${matchedCmds.length} command(s)`;

      const reply = await message.reply({
        body: msg,
        attachment: fs.existsSync(localImagePath) ? fs.createReadStream(localImagePath) : null
      });

      setTimeout(() => {
        global.GoatBot.api.unsendMessage(reply.messageID);
        global.GoatBot.api.unsendMessage(event.messageID);
      }, 45 * 1000);
      return;
    }

    // /help — all commands
    if (args.length === 0) {
      const categories = {};
      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;
        const cat = (cmd.config.category || "Uncategorized").toUpperCase();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }

      let msg =
`${header}
`;

      for (const cat of Object.keys(categories).sort()) {
        msg += `┍━[ ${cat} ]\n`;
        msg += categories[cat].sort().map(name => `┋❍ ${name}`).join("\n") + "\n";
        msg += `┕━━━━━━━━━━━━━━✦\n`;
      }

      msg += `\n┍━━━[ INFO ]━━━•◇
┋❍ TOTAL CMDS : ${commands.size}
┋❍ PREFIX      : ${prefix}
┋❍ CREATOR     : Christus
┋❍ FACEBOOK    : https://www.facebook.com/Anos.Christus
┕━━━━━━━━━━━━•◇`;

      const reply = await message.reply({
        body: msg,
        attachment: fs.existsSync(localImagePath) ? fs.createReadStream(localImagePath) : null
      });

      setTimeout(() => {
        global.GoatBot.api.unsendMessage(reply.messageID);
        global.GoatBot.api.unsendMessage(event.messageID);
      }, 45 * 1000);
      return;
    }

    // /help <command>
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command) {
      return message.reply(`❌ The command "${commandName}" was not found.`);
    }

    const c = command.config;
    const description =
      typeof c.description === "string" ? c.description :
      (c.shortDescription?.en || c.longDescription?.en) || "No description.";
    const aliasText = c.aliases && c.aliases.length > 0 ? c.aliases.join(", ") : "None";

    let guideText = "";
    if (c.guide) {
      guideText = typeof c.guide === "string"
        ? c.guide
        : Object.entries(c.guide).map(([lang, val]) => `${lang.toUpperCase()}: ${val}`).join("\n");
    } else {
      guideText = "No guide available.";
    }

    const helpMsg =
`${header}
┍━[ 🔎 COMMAND HELP ]
┋❍ NAME        : ${c.name}
┋❍ DESCRIPTION : ${description}
┋❍ ALIASES     : ${aliasText}
┋❍ VERSION     : ${c.version || "1.0"}
┋❍ ROLE        : ${roleTextToString(c.role)}
┋❍ COOLDOWN    : ${c.countDown || c.cooldown || 2}s
┋❍ AUTHOR      : ${c.author || "Unknown"}
┕━━━━━━━━━━━━━━✦

┍━[ 📜 USAGE GUIDE ]
${guideText.split("\n").map(line => "┋❍ " + line).join("\n")}
┕━━━━━━━━━━━━━━✦`;

    const reply = await message.reply(helpMsg);

    setTimeout(() => {
      global.GoatBot.api.unsendMessage(reply.messageID);
      global.GoatBot.api.unsendMessage(event.messageID);
    }, 45 * 1000);
  }
};