const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "4.3",
    author: "Christus",
    countDown: 2,
    role: 0,
    shortDescription: { en: "Command list + details" },
    category: "info",
    guide: { en: "help <command> — show command details, -ai for suggestions" },
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const uid = event.senderID;

      // --- Avatar utilisateur ---
      let avatar = null;
      try {
        avatar = await usersData.getAvatarUrl(uid);
      } catch {}
      if (!avatar) avatar = "https://i.imgur.com/TPHk4Qu.png";

      // --- Fonction suppression automatique avec effet visuel ---
      const deleteMessageAfter = async (msgID, delay = 15000) => {
        const steps = [10, 5, 3, 2, 1]; // secondes restantes
        for (const s of steps) {
          setTimeout(() => {
            message.edit(msgID, `⏳ Message auto-suppression dans ${s}s...`);
          }, delay - s * 1000);
        }
        setTimeout(async () => {
          try {
            await message.unsend(msgID);
          } catch (err) {
            console.error("❌ Erreur suppression message HELP:", err.message);
          }
        }, delay);
      };

      // --- Mode AI Suggestion ---
      if (args[0]?.toLowerCase() === "-ai") {
        const keyword = args[1]?.toLowerCase() || "";
        const allCmds = Array.from(commands.keys());
        const suggestions = allCmds
          .map(cmd => {
            const matchPercent = Math.floor(
              Math.min(100, Math.max(40, 100 - Math.abs(cmd.length - keyword.length) * 10))
            );
            return { cmd, percent: matchPercent };
          })
          .filter(c => c.cmd.includes(keyword))
          .sort((a, b) => b.percent - a.percent)
          .slice(0, 10);

        if (!suggestions.length) {
          const res = await message.reply({
            body: "❌ No smart suggestions found.",
            attachment: await global.utils.getStreamFromURL(avatar),
          });
          return deleteMessageAfter(res.messageID);
        }

        let body = "🤖 Smart suggestions:\n";
        suggestions.forEach(s => {
          body += `🔹 .${s.cmd} (${s.percent}% match)\n`;
        });

        const res = await message.reply({
          body,
          attachment: await global.utils.getStreamFromURL(avatar),
        });
        return deleteMessageAfter(res.messageID);
      }

      // --- Mode liste générale ---
      if (!args || args.length === 0) {
        let body = "📜 𝐆𝐎𝐀𝐓 𝐁𝐎𝐓 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐋𝐈𝐒𝐓\n\n";

        const cats = {};
        for (let [name, cmd] of commands) {
          const category = (cmd.config.category || "Other").toString();
          if (!cats[category]) cats[category] = [];
          cats[category].push(name);
        }

        for (const category of Object.keys(cats).sort()) {
          const list = cats[category].sort();
          body += `📂${category}\n`;
          body += list.length ? list.map(c => `✿ ${c}`).join("  ") : "No commands";
          body += "\n\n";
        }

        body += `📊 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${commands.size}\n`;
        body += `🔧 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐈𝐧𝐟𝐨: .help <command>\n`;
        body += `🔍 𝐒𝐞𝐚𝐫𝐜𝐡: .help -s <keyword>\n`;
        body += `🤖 𝐀𝐈 𝐒𝐮𝐠𝐠𝐞𝐬𝐭: .help -ai <command>\n\n`;
        body += `✨ 𝗖𝗛𝗥𝗜𝗦𝗧𝗨𝗦`;

        const res = await message.reply({
          body,
          attachment: await global.utils.getStreamFromURL(avatar),
        });

        return deleteMessageAfter(res.messageID);
      }

      // --- Mode info commande spécifique ---
      const query = args[0].toLowerCase();
      const command = commands.get(query) || commands.get(aliases.get(query));
      if (!command) {
        const res = await message.reply({
          body: `❌ Command "${query}" not found.`,
          attachment: await global.utils.getStreamFromURL(avatar),
        });
        return deleteMessageAfter(res.messageID);
      }

      const cfg = command.config || {};
      const roleString = { 0: "All users", 1: "Group Admins", 2: "Bot Admins" }[cfg.role] || "Unknown";
      const aliasGlobal = Array.isArray(cfg.aliases) && cfg.aliases.length ? cfg.aliases.join(", ") : "Do not have";
      const desc = cfg.longDescription?.en || cfg.shortDescription?.en || "No description.";
      const usageTemplate = cfg.guide?.en || cfg.name;

      const card = [
        `╭── 🎯 ${cfg.name.toUpperCase()} ──✦`,
        `│ 📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${desc}`,
        `│ 📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${cfg.category || "Misc"}`,
        `├── 🔤 𝐀𝐋𝐈𝐀𝐒𝐄𝐒 ──✦`,
        `│ 🌐 𝐆𝐥𝐨𝐛𝐚𝐥: ${aliasGlobal}`,
        `│ 💬 𝐓𝐡𝐫𝐞𝐚𝐝: Do not have`,
        `├── ⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐓𝐈𝐎𝐍 ──✦`,
        `│ 🛡️ 𝐑𝐨𝐥𝐞: ${cfg.role} (${roleString})`,
        `│ ⏱️ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧: ${cfg.countDown || 1}s`,
        `│ 🚀 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${cfg.version || "1.0"}`,
        `│ 👨‍💻 𝐀𝐮𝐭𝐡𝐨𝐫: ${cfg.author || "Unknown"}`,
        `├── 💡 𝐔𝐒𝐀𝐆𝐄 ──✦`,
        `│ Use .${usageTemplate}`,
        `╰────────────────✦`,
        ``,
        `🔧 𝐎𝐩𝐭𝐢𝐨𝐧𝐬: .help ${cfg.name.toLowerCase()} [-u | -i | -a]`,
      ].join("\n");

      const res = await message.reply({
        body: card,
        attachment: await global.utils.getStreamFromURL(avatar),
      });

      return deleteMessageAfter(res.messageID);
    } catch (err) {
      console.error("HELP CMD ERROR:", err);
      await message.reply(`⚠️ Error: ${err.message || err}`);
    }
  },
};