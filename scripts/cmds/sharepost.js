 module.exports = {
  config: {
    name: "sharepost", // lowercase for safety
    version: "4.2",
    author: "Tanjiro",
    countDown: 5,
    role: 0,
    shortDescription: "Share report messages",
    longDescription: "Random, all, or specific report messages",
    category: "tools",
    guide: "{pn} / {pn} all / {pn} 1-17"
  },

  onStart: async function ({ message, args }) {
    try {

      const list = [
`Sir,
I urgently report a case where my client’s personal Video has been used without permission.
Please remove the unauthorized content without delay.
Thanks for your prompt action.`,

`Dear Sir,
On behalf of my client, I am reporting an infringement involving unauthorized use of a personal photograph.
Please remove the infringing material immediately.`,

`Hi Sir,
Someone is using my personal video without consent. I am a victim of harassment.
Please take action and remove it.`,

`Hello,
Unauthorized use of my client's personal photo detected.
Please remove it immediately.`,

`Hello Sir,
Someone is using my client's photo without permission.
Kindly remove it immediately.`,

`Hello,
A video featuring me has been shared without consent.
Please remove it.`,

`Hello Sir,
My personal video has been used without permission.
Remove it immediately.`,

`Hello,
This is an urgent request to remove unauthorized content.`,

`Hello,
My client’s photo is being used without consent.
Remove it.`,

`Hello,
A personal photo has been used without authorization.
Remove it.`,

`Hello,
You are using my client’s photo without permission.
Remove it.`,

`Hello,
Reporting unauthorized use of photograph.
Remove it.`,

`Hello,
This content violates rules.
Remove immediately.`,

`Copying personal video without permission is illegal.
Remove it.`,

`Hi,
A video has been posted without permission.
Remove it.`,

`Dear Team,
This violates terms of service.
Remove it.`,

`Illegal content detected.
Remove immediately.`
      ];

      // ALL
      if (args[0] && args[0].toLowerCase() === "all") {
        return message.reply(
          list.map((msg, i) => `${i + 1}.\n${msg}`).join("\n\n")
        );
      }

      // NUMBER
      if (args[0] && !isNaN(args[0])) {
        const index = parseInt(args[0]) - 1;

        if (index < 0 || index >= list.length) {
          return message.reply(`Invalid number! Use 1 - ${list.length}`);
        }

        return message.reply(list[index]);
      }

      // RANDOM
      const randomIndex = Math.floor(Math.random() * list.length);
      return message.reply(list[randomIndex]);

    } catch (err) {
      console.error(err);
      return message.reply("Error occurred!");
    }
  }
};