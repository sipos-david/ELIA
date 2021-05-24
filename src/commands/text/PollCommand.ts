import Command from "../Command";
import Discord, {EmojiIdentifierResolvable, Message} from "discord.js";
import { CommandTypeEnum } from "../CommandTypeEnum";
import Elia from "../../Elia";

export default class PollCommand extends Command {
    name = "poll";
    description = "Creates a poll, up to 10 choices";
    usage = "  'option1' 'option2' 'option3' ... 'option10' ";
    hasArguments = true;
    type = CommandTypeEnum.OTHER;
    emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    execute(message: Message, args: string[], elia: Elia): void {
        if (!args.length)
            return elia.messageComponent.reply(
                message,
                "You need to send the arguments!"
            );

        const command = args.join(" ");
        // eslint-disable-next-line quotes
        const rawPollArgs = command.split('" "');

        const pollArgs: string[] = [];

        rawPollArgs.forEach((item) => {
            pollArgs.push(item.slice(1, -1));
        });

        if (pollArgs.length > 10)
            return elia.messageComponent.reply(message, "Too many arguments!");

        let pollMessage = new Discord.MessageEmbed().setColor(0x61b15a);

        if (message.member) {
            pollMessage = pollMessage.setDescription(
                "Submitted by " + message.member.displayName
            );
        }
        if (message.author) {
            const avatar = message.author.avatarURL();
            if (avatar != null) {
                pollMessage = pollMessage.setThumbnail(avatar);
            }
        }
        if (message.guild) {
            pollMessage = pollMessage.setFooter(message.guild.name);
        }

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
            pollMessage.addField("Available options:", options, false);
            message.channel.send(pollMessage).then((messageReaction) => {
                for (let i = 0; i < pollArgs.length; i++) {
                    messageReaction.react(this.emojis[i + 1] as EmojiIdentifierResolvable);
                }
            });
        }

        elia.loggingComponent.log(message.author.username + " created a poll");
    }
}
