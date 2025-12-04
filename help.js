module.exports = {
  config: {
    name: "help",
    aliases: ["commands"],
    version: "0.0.1",
    author: "Christus",
    countDown: 2,
    role: 0,
    category: "utility"
  },

  onStart: async function ({ message, args, commandName }) {
    const cmds = global.GoatBot.commands;
    if (!cmds) return message.reply("Command collection is not available.");

    if (args.length) {
      const q = args[0].toLowerCase();
      const cmd = [...cmds.values()].find(
        c => c.config.name === q || (c.config.aliases && c.config.aliases.includes(q))
      );
      if (!cmd) return message.reply(`No command called “${q}”.`);
      const i = cmd.config;
      const detail = `
╭─────────────────────◊
│ ▸ Command: ${i.name}
│ ▸ Aliases: ${i.aliases?.length ? i.aliases.join(", ") : "None"}
│ ▸ Can use: ${i.role === 2 ? "Admin Only" : i.role === 1 ? "VIP Only" : "All Users"}
│ ▸ Category: ${i.category?.toUpperCase() || "NIX"}
│ ▸ PrefixEnabled?: ${i.prefix === false ? "False" : "True"}
│ ▸ Author: ${i.author || "Unknown"}
│ ▸ Version: ${i.version || "N/A"}
╰─────────────────────◊
      `.trim();
      return message.reply(detail);
    }

    const cats = {};
    [...cmds.values()]
      .filter((c, i, s) => i === s.findIndex(x => x.config.name === c.config.name))
      .forEach(c => {
        const cat = c.config.category || "UNCATEGORIZED";
        if (!cats[cat]) cats[cat] = [];
        if (!cats[cat].includes(c.config.name)) cats[cat].push(c.config.name);
      });

    let msg = "";
    Object.keys(cats).sort().forEach(cat => {
      msg += `╭─────『 ${cat.toUpperCase()} 』\n`;
      cats[cat].sort().forEach(n => {
        msg += `│ ▸ ${n}\n`;
      });
      msg += `╰──────────────\n`;
    });

    msg += `
╭──────────────◊
│ » Total commands: ${cmds.size}
│ » A Powerful GoatBot
│ » 𝐶𝐻𝑅𝐼𝑆𝑇𝑈𝑆
╰──────────◊
「 𝗖𝗛𝗥𝗜𝗦𝗧𝗨𝗦 𝗕𝗢𝗧 」
    `.trim();

    await message.reply(msg);
  }
};