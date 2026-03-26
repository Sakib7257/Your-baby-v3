module.exports = {
  config: {
    name: "imposter",
    version: "1.0",
    author: "Tanjiro",
    countDown: 5,
    role: 0,
    shortDescription: "Imposter report messages",
    longDescription: "Report fake Facebook account using your identity",
    category: "tools",
    guide: "{pn} / {pn} all / {pn} 1-20"
  },

  onStart: async function ({ message, args }) {
    try {

      // 🎀 Safe reaction
      if (message.react) {
        await message.react("🎀");
      }

      const list = [
`Dear Facebook Team,
I do not have a Facebook account, yet someone has created one using my personal information without my consent.
Please remove the fake account immediately.
Thank you.`,

`Hello Facebook Team,
An account has been created using my identity without my permission, even though I do not own a Facebook account.
Kindly remove this fraudulent account.`,

`Dear Team,
Someone has opened a Facebook account using my personal details without authorization. I do not have any account myself.
Please remove it as soon as possible.`,

`Hello,
A fake Facebook account has been created with my personal information, despite not having an account.
Please remove it immediately.`,

`Dear Facebook Support,
Someone is impersonating me by creating a Facebook account using my identity. I do not have an account.
Kindly delete it.`,

`Hello Facebook Team,
I do not use Facebook, but someone has created an account using my details.
Please remove it urgently.`,

`Dear Sir/Madam,
A fake Facebook account has been created using my personal information without my consent.
Please take action to remove it.`,

`Hello Team,
I do not have a Facebook account, but someone is using my identity.
Please remove the account.`,

`Dear Facebook Team,
An unauthorized account has been created using my identity. I have never signed up.
Please remove it.`,

`Hello,
My personal information has been used to create a fake account without permission.
Remove it immediately.`,

`Dear Team,
Someone has created a Facebook account using my details. I do not own any account.
Please remove it.`,

`Hello Facebook Support,
Someone has created an account using my identity without authorization.
Please delete it immediately.`,

`Dear Sir,
A fraudulent Facebook account exists under my identity.
Please remove it.`,

`Hello,
This is a report of impersonation using my identity.
Please remove the account.`,

`Dear Facebook Team,
Someone is using my personal information to run a fake account.
Please remove it quickly.`,

`Hello Team,
I do not have a Facebook account, but someone created one using my identity.
Please remove it immediately.`,

`Dear Support Team,
A fake account has been created using my personal details.
Please take action.`,

`Hello Facebook,
My identity has been used without permission to create an account.
Please delete it.`,

`Dear Team,
Someone has impersonated me using my personal information.
Please remove the account.`,

`Hello,
A fake account has been created using my identity without my consent.
Please remove it urgently.`
      ];

      // ALL
      if (args[0] && args[0].toLowerCase() === "all") {
        return message.reply(
          list.map((msg, i) => `${i + 1}.\n${msg}`).join("\n\n")
        );
      }

      // NUMBER
      if (args[0] && !isNaN(args[0])) {
        const index = parseInt(args[0]);

        if (index < 1 || index > list.length) {
          return message.reply(`Invalid number! Use 1 - ${list.length}`);
        }

        return message.reply(list[index - 1]);
      }

      // RANDOM
      const randomIndex = Math.floor(Math.random() * list.length);
      return message.reply(list[randomIndex]);

    } catch (err) {
      console.error("CMD ERROR:", err);
      return message.reply(`Error: ${err.message}`);
    }
  }
};