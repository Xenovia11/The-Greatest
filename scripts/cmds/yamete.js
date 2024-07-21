const fs = require('fs');
module.exports = {
  config: {
    name: "yamete",
    version: "1",
    author: "Thea",
    countDown: 5,
    role: 0,
    shortDescription: "vocal aesther 😜👍🏻",
    longDescription: "no prefix",
    category: "VOCAL",
  },
  onStart: async function(){},
  onChat: async function({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "aesther") {
      return message.reply({
        body: "ur Time is 𝗨𝗣 my Time is 𝗡𝗢𝗪✨",
        attachment: fs.createReadStream("scripts/cmds/cache/yamete.mp3"),
      });
    }
  }
};
