const axios = require('axios');


const nix = 'http://65.109.80.126:20409';

module.exports.config = {
  name: "meta",
  version: "0.0.1",
  role: 0,
  author: "Christus x Aesther",
  description: "Meta AI",
  category: "general",
  cooldowns: 2,
  hasPrefix: false,
};

module.exports.onStart = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const question = args.join(' ').trim();

  if (!question) {
    return api.sendMessage("pose ta question .", threadID, messageID);
  }

  try {
    const response = await axios.get(`${nix}/aryan/meta-ai?query=${encodeURIComponent(question)}`);

    const metaAnswer = response.data?.data; 

    if (metaAnswer) {
      return api.sendMessage(metaAnswer, threadID, messageID);
    } 
    else {
      return api.sendMessage("[⚜]➜ Something went wrong. ", threadID, messageID);
    }
  } catch (error) {
    console.error('Meta API Error:', error.response ? error.response.data : error.message);
    return api.sendMessage("[⚜️]➜ erreur orrr ne reesai pas même", threadID, messageID);
  }
};