const Discord = require("discord.js");

module.exports = {
    name: "poll",
    description: "Sends a poll",

    emojis: ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"],

    async execute(msg, args, _bot) {
        if (!args.length)
            return msg.channel.reply("You need to send the arguments!");

        let command = args.join(" ");
        let rawPollArgs = command.split('" "');

        let pollArgs = new Array();

        rawPollArgs.forEach((item) => {
            pollArgs.push(item.slice(1, -1));
        });

        if (pollArgs.length > 10)
            return msg.channel.reply("Too many arguments!");

        let pollMessage = new Discord.MessageEmbed()
            .setColor(0x61b15a)
            .setDescription("Submitted by " + msg.member.displayName)
            .setThumbnail(msg.author.avatarURL())
            .setFooter(msg.guild.name);

        if (pollArgs.length == 1) {
            pollMessage.setTitle(pollArgs[0]);
            msg.channel.send(pollMessage).then((messageReaction) => {
                messageReaction.react("👍");
                messageReaction.react("👎");
            });
        } else {
            let options = "";
            for (let i = 0; i < pollArgs.length; i++) {
                options += "\n\n" + this.emojis[i + 1] + " " + pollArgs[i];
            }
            pollMessage.setTitle("Choose one!");
            pollMessage.addField("Avaliable options:", options, false);
            msg.channel.send(pollMessage).then((messageReaction) => {
                for (let i = 0; i < pollArgs.length; i++) {
                    messageReaction.react(this.emojis[i + 1]);
                }
            });
        }

        console.log(msg.author.username + " created a poll");
        msg.delete();
    },
};
