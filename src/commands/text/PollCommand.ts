import Command from "../Command";
import Discord, { EmojiIdentifierResolvable, Message } from "discord.js";
import { CommandTypeEnum } from "../CommandTypeEnum";
import EliaInstance from "../../EliaInstance";
import CommandCallSource from "../../model/CommandCallSource";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class PollCommand extends Command {
    name = "poll";
    description = "Creates a poll, from 2, up to 10 choices";
    usage = "*required:* <option1> <option2> <option3> ... '<option10>";
    hasArguments = true;
    type = CommandTypeEnum.OTHER;
    emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    execute(
        source: CommandCallSource,
        args: string[],
        elia: EliaInstance
    ): void {
        if (!args.length)
            return elia.messageComponent.reply(
                source,
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
            return elia.messageComponent.reply(source, "Too many arguments!");

        let pollMessage = new Discord.MessageEmbed().setColor(0x61b15a);

        if (source.member) {
            pollMessage = pollMessage.setDescription(
                "Submitted by " + source.member.displayName
            );
        }

        const avatar = source.user.avatarURL();
        if (avatar != null) {
            pollMessage = pollMessage.setThumbnail(avatar);
        }

        if (source.guild) {
            pollMessage = pollMessage.setFooter({ text: source.guild.name });
        }

        if (pollArgs.length == 1) {
            this.createYesOrNoPoll(pollMessage, pollArgs, source);
        } else {
            this.createOptionsPoll(pollArgs, pollMessage, source);
        }

        elia.loggingComponent.log(source.user.username + " created a poll");
    }

    private createOptionsPoll(
        pollArgs: string[],
        pollMessage: Discord.MessageEmbed,
        source: CommandCallSource
    ) {
        let options = "";
        for (let i = 0; i < pollArgs.length; i++) {
            options += "\n\n" + this.emojis[i + 1] + " " + pollArgs[i];
        }
        pollMessage.setTitle("Choose one!");
        pollMessage.addField("Available options:", options, false);

        const channel = source.channel;
        if (channel) {
            channel
                .send({ embeds: [pollMessage] })
                .then((messageReaction: Message) => {
                    for (let i = 0; i < pollArgs.length; i++) {
                        messageReaction.react(
                            this.emojis[i + 1] as EmojiIdentifierResolvable
                        );
                    }
                });
        }
    }

    private createYesOrNoPoll(
        pollMessage: Discord.MessageEmbed,
        pollArgs: string[],
        source: CommandCallSource
    ) {
        if (pollArgs[0] !== undefined) {
            pollMessage.setTitle(pollArgs[0]);
            const channel = source.channel;
            if (channel) {
                channel
                    .send({ embeds: [pollMessage] })
                    .then((messageReaction: Message) => {
                        messageReaction.react("👍");
                        messageReaction.react("👎");
                    });
            }
        }
    }

    createSlashCommandData(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
        // eslint-disable-next-line indent
    > {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("options")
                    .setDescription(
                        "<option1> <option2> <option3> ... <option10>"
                    )
                    .setRequired(true)
            );
    }
}
