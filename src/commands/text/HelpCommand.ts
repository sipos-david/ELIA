import { Message } from "discord.js";
import EliaInstance from "../../EliaInstance";
import CommandCallSource from "../../model/CommandCallSource";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class HelpCommand extends Command {
    name = "help";
    description = "List all of my commands or info about a specific command.";
    usage = "*optional:* [command name]";
    type = CommandTypeEnum.UTILITY;
    guildOnly = false;

    constructor(private readonly commands: Map<string, Command>) {
        super();
    }

    execute(
        source: CommandCallSource,
        args: string[],
        elia: EliaInstance
    ): void {
        elia.loggingComponent.log(source.user.username + " requested help");

        if (!args.length) {
            this.helpSendAllCommands(source, elia);
        } else {
            const arg = args[0];
            if (arg) {
                const command = this.commands.get(arg.toLowerCase());
                if (!command) {
                    return elia.messageComponent.reply(
                        source,
                        "that's not a valid command!"
                    );
                } else this.helpCommandUsage(source, command, elia);
            }
        }
    }

    /**
     * Reply's all commands to the user
     *
     * @param {CommandCallSource} source the source of the command call
     * @param {EliaInstance} elia the elia instance for the guild
     */
    helpSendAllCommands(source: CommandCallSource, elia: EliaInstance): void {
        const embedMessage = elia.messageComponent.buildBaseEmbed();
        elia.messageComponent.addFooterToEmbed(source, embedMessage);
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

        source.user
            .send({ embeds: [embedMessage] })
            .then((msg: Message) => {
                elia.messageComponent.reply(
                    source,
                    "I've sent you a DM with all my commands!"
                );
                elia.messageComponent.deleteMsgTimeout(msg);
            })
            .catch((error: unknown) => {
                elia.loggingComponent.log(
                    `Could not send help DM to ${source.user.tag}.\n`
                );
                elia.loggingComponent.error(error);
                elia.messageComponent.reply(
                    source,
                    "it seems like I can't DM you! Do you have DMs disabled?"
                );
            });
    }

    /**
     * Reply's a command use to the user
     *
     * @param {CommandCallSource} source the source of the command call
     * @param {Command} command the command to display the usage
     * @param {EliaInstance} elia the elia instance for the guild
     */
    helpCommandUsage(
        source: CommandCallSource,
        command: Command,
        elia: EliaInstance
    ): void {
        const embedMessage = elia.messageComponent.buildBaseEmbed();
        elia.messageComponent.addFooterToEmbed(source, embedMessage);

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

        const channel = source.channel;
        if (channel) {
            channel
                .send({ embeds: [embedMessage] })
                .then((msg: Message) =>
                    elia.messageComponent.deleteMsgTimeout(msg)
                );
        }
    }

    createSlashCommandData(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
        // eslint-disable-next-line indent
    > {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}
