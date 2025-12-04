const fsp = require('fs').promises;

module.exports.config = {
  name: "file",
  version: "1.0.0",
  role: 2,
  author: "Christus",
  usePrefix: true,
  description: "Send raw content of a file from scripts/cmds folder",
  category: "utility",
  guide: { en: "[filename]" },
  countDown: 1
};

module.exports.onStart = async function({ api, event, args }) {
  if (args.length === 0) {
    return api.sendMessage("[⚜]➜ Please provide the file name.", event.threadID, event.messageID);
  }

  const fileName = args[0];
  const filePath = `scripts/cmds/${fileName}.js`;

  try {
    const content = await fsp.readFile(filePath, "utf8");
    await api.sendMessage(content, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("[⚜]➜ File not found or cannot be read.", event.threadID, event.messageID);
  }
};