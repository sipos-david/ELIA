const Command = require("../Command");
const Discord = require("discord.js");
const CommandTypeEnum = require("../CommandTypeEnum");

class PollCommand extends Command {
    name = "poll";
    description = "Creates a poll, up to 10 choices";
    usage = '  "option1" "option2" "option3" ... "option10" ';
    usage = " ";
    hasArguments = true;
    type = CommandTypeEnum.OTHER;
    emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    async execute(message, args, elia) {
        if (!args.length)
            return elia.messageComponent.reply(
                message,
                "You need to send the arguments!"
            );

        let command = args.join(" ");
        let rawPollArgs = command.split('" "');

        let pollArgs = new Array();

        rawPollArgs.forEach((item) => {
            pollArgs.push(item.slice(1, -1));
        });

        if (pollArgs.length > 10)
            return elia.messageComponent.reply(message, "Too many arguments!");

        let pollMessage = new Discord.MessageEmbed()
            .setColor(0x61b15a)
            .setDescription("Submitted by " + message.member.displayName)
            .setThumbnail(message.author.avatarURL())
            .setFooter(message.guild.name);

        if (pollArgs.length == 1) {
            pollMessage.setTitle(pollArgs[0]);
            message.channel.send(pollMessage).then((messageReaction) => {
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
            message.channel.send(pollMessage).then((messageReaction) => {
                for (let i = 0; i < pollArgs.length; i++) {
                    messageReaction.react(this.emojis[i + 1]);
                }
            });
        }

        elia.loggingComponent.log(message.author.username + " created a poll");
    }
}

module.exports = PollCommand;
