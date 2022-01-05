import { Message } from "discord.js";
import EliaInstance from "../../EliaInstance";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

export default class HelpCommand extends Command {
    name = "help";
    description = "List all of my commands or info about a specific command.";
    usage = "*optional:* [command name]";
    type = CommandTypeEnum.UTILITY;
    guildOnly = false;

    constructor(private readonly commands: Map<string, Command>) {
        super();
    }

    execute(message: Message, args: string[], elia: EliaInstance): void {
        elia.loggingComponent.log(message.author.username + " requested help");

        if (!args.length) {
            this.helpSendAllCommands(message, elia);
        } else {
            const arg = args[0];
            if (arg) {
                const command = this.commands.get(arg.toLowerCase());
                if (!command) {
                    return elia.messageComponent.reply(
                        message,
                        "that's not a valid command!",
                        elia.properties
                    );
                } else this.helpCommandUsage(message, command, elia);
            }
        }
    }

    /**
     * Reply's all commands to the user
     *
     * @param {Message} message the Discord message which requested all commands
     * @param {EliaInstance} elia the elia instance for the guild
     */
    helpSendAllCommands(message: Message, elia: EliaInstance): void {
        const embedMessage = elia.messageComponent.buildBaseEmbed();
        elia.messageComponent.addFooterToEmbed(message, embedMessage);
        embedMessage.setTitle("Here's a list of all my commands:");
        if (elia.bot.user) {
            embedMessage.setThumbnail(elia.bot.user.displayAvatarURL());
        }
        const musicCommandsList: string[] = [];
        const soundEffectCommandsList: string[] = [];
        const utilityCommandsList: string[] = [];
        const otherCommandsList: string[] = [];

        this.commands.forEach(
            (command: { type: CommandTypeEnum; name: string }) => {
                switch (command.type) {
                    case CommandTypeEnum.MUSIC:
                        musicCommandsList.push(command.name);
                        break;
                    case CommandTypeEnum.SOUNDEFFECT:
                        soundEffectCommandsList.push(command.name);
                        break;
                    case CommandTypeEnum.UTILITY:
                        utilityCommandsList.push(command.name);
                        break;
                    case CommandTypeEnum.OTHER:
                        otherCommandsList.push(command.name);
                        break;
                }
            }
        );

        embedMessage.addFields(
            {
                name: "Music Commands",
                value: musicCommandsList.join(", "),
            },
            {
                name: "SoundEffect Commands",
                value: soundEffectCommandsList.join(", "),
            },

            {
                name: "Utility Commands",
                value: utilityCommandsList.join(", "),
            },
            {
                name: "Other Commands",
                value: otherCommandsList.join(", "),
            },
            {
                name: "Use the command below to get info on a specific command!",
                value: `\`\`\`${elia.properties.prefix}help [command name]\`\`\``,
            }
        );

        message.author
            .send({ embeds: [embedMessage] })
            .then((msg: Message) => {
                elia.messageComponent.reply(
                    message,
                    "I've sent you a DM with all my commands!",
                    elia.properties
                );
                elia.messageComponent.deleteMsgTimeout(msg, elia.properties);
            })
            .catch((error: any) => {
                elia.loggingComponent.log(
                    `Could not send help DM to ${message.author.tag}.\n`
                );
                elia.loggingComponent.error(error);
                message.reply(
                    "it seems like I can't DM you! Do you have DMs disabled?"
                );
            });
    }

    /**
     * Reply's a command use to the user
     *
     * @param {Message} message the Discord message which requested help for a command
     * @param {Command} command the command to display the usage
     * @param {EliaInstance} elia the elia instance for the guild
     */
    helpCommandUsage(
        message: Message,
        command: Command,
        elia: EliaInstance
    ): void {
        const embedMessage = elia.messageComponent.buildBaseEmbed();
        elia.messageComponent.addFooterToEmbed(message, embedMessage);

        embedMessage.setTitle("Here's the help for: " + command.name);

        if (elia.bot.user) {
            embedMessage.setThumbnail(elia.bot.user.displayAvatarURL());
        }
        embedMessage.addFields(
            {
                name: "Description",
                value: command.description,
            },
            {
                name: "Usage:",
                value: `\`\`\`${elia.properties.prefix}${command.name} ${command.usage}\`\`\``,
            }
        );

        message.channel
            .send({ embeds: [embedMessage] })
            .then((msg: Message) =>
                elia.messageComponent.deleteMsgTimeout(msg, elia.properties)
            );
        elia.messageComponent.deleteMsgNow(message);
    }
}
