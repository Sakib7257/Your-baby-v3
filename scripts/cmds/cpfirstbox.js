module.exports = {
  config: {
    name: "cpfirstbox",
    version: "2.1",
    author: "Tanjiro",
    countDown: 5,
    role: 0,
    shortDescription: "Copyright report messages",
    longDescription: "Send copyright / unauthorized use reports",
    category: "tools",
    guide: "{pn} / {pn} all / {pn} 1-20"
  },

  onStart: async function ({ message, args }) {
    try {

      // 🎀 Safe reaction (universal fix)
      try {
        if (message?.react) {
          await message.react("🎀");
        } else if (message?.messageID && global.api) {
          global.api.setMessageReaction("🎀", message.messageID, () => {}, true);
        }
      } catch (e) {
        console.log("Reaction not supported");
      }

      const list = [
`The reported image constitutes an unauthorized reproduction of my original photographic work. As the sole copyright holder, I have not granted consent for its use.`,

`This is a direct infringement of my intellectual property rights. The visual content in question was captured by me and published prior to the infringing post.`,

`I am submitting this formal report to protect my exclusive rights as the creator of this photograph. The reported party has duplicated my work without a license.`,

`The infringing post contains a verbatim copy of my protected visual expression. I hereby request the immediate removal of this unauthorized material.`,

`As the original photographer, I claim full copyright ownership of the reported image. This unauthorized distribution infringes upon my legal protections.`,

`The reported content is a digital duplicate of a photograph originally authored and published by me. No permission for third-party use has been issued.`,

`This imagery is my proprietary creative work. Its presence on the reported account is a violation of international copyright standards and platform policy.`,

`The reported party is utilizing my original visual assets without legal authorization. I am the rightful owner and creator of the photograph in question.`,

`This report pertains to the unlawful use of my copyrighted photography. The image was taken by me and is being used here without my express written consent.`,

`The reported post features a photograph that I personally produced. As the author, I retain all rights to its distribution and public display.`,

`I am the legal copyright holder of the attached visual content. The reported account has misappropriated my creative work for their own publication.`,

`The image displayed in the reported link is an unauthorized copy of my original work. I have not authorized the reported party to use my intellectual property.`,

`This is a formal notification of copyright infringement. The reported image belongs exclusively to me and was uploaded here without my permission.`,

`The reported account is displaying my original photographic work in violation of my exclusive rights under copyright law.`,

`I am the original creator of the visual media found at the reported URL. The use of this content by the reported party is strictly unauthorized.`,

`This image is a protected work of authorship. The reported party has replicated my specific visual composition and creative content without a license.`,

`The reported content is an infringement of my copyright. I am the person who captured this photograph and I hold all associated legal rights.`,

`Unauthorized use of my original imagery has been detected. As the copyright owner, I am requesting the removal of this infringing material.`,

`The reported post contains my intellectual property. I am the sole author of this photograph and did not provide authorization for its re-upload.`,

`This description covers original visual content created by me. The infringing party has copied the image in its entirety without my knowledge or consent.`
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