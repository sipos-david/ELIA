import { Client, Message, MessageEmbed } from "discord.js";
import Command from "../../commands/Command";
import { CommandTypeEnum } from "../../commands/CommandTypeEnum";
import CommandComponent from "../CommandComponent";
import DataComponent from "./DataComponent";
import LoggingComponent from "./LoggingComponent";

/**
 * Component that handles ELIA-s messages. Sends Discord embedded messages.
 */
export default class MessageComponent {
    constructor(
        bot: Client,
        dataComponent: DataComponent,
        loggingComponent: LoggingComponent,
        commandComponent: CommandComponent
    ) {
        this.bot = bot;
        this.dataComponent = dataComponent;
        this.loggingComponent = loggingComponent;
        this.commandComponent = commandComponent;
    }

    /**
     * The Discord Client
     *
     * @type {Client}
     */
    bot: Client;

    /**
     * The component for data
     *
     * @type {DataComponent}
     */
    dataComponent: DataComponent;

    /**
     * The component for logging
     *
     * @type {LoggingComponent}
     */
    loggingComponent: LoggingComponent;

    /**
     * The component for commands
     *
     * @type {CommandComponent}
     */
    commandComponent: CommandComponent;

    /**
     * Replies to the message.
     *
     * @param {Message} message the Discord message to reply to
     * @param {string} answer the answer in string
     * @param {?boolean} shouldDelete optional, determines to delete the message after the reply, default is true
     */
    reply(message: Message, answer: string, shouldDelete = true): void {
        const replyMsg = this.buildBaseEmbed().setTitle(answer);
        this.addFooterToEmbed(message, replyMsg);

        message.channel.send({ embeds: [replyMsg] }).then((msg: Message) => {
            this.deleteMsgTimeout(msg);
        });
        if (shouldDelete) {
            this.deleteMsgNow(message);
        }
    }

    /**
     * Deletes a message after a given time.
     *
     * @param {Message} message the Discord message to delete
     */
    deleteMsgTimeout(message: Message): void {
        if (
            message &&
            !message.deleted &&
            message.deletable &&
            message.channel.type !== "DM"
        )
            setTimeout(
                () =>
                    message.delete().catch((error: any) => {
                        this.loggingComponent.error(error);
                    }),
                this.dataComponent.getMessageDisplayTime()
            );
    }

    /**
     * Deletes a message instantly.
     *
     * @param {Message} message the Discord message to delete
     */
    deleteMsgNow(message: Message): void {
        if (
            message &&
            !message.deleted &&
            message.deletable &&
            message.channel.type !== "DM"
        )
            message.delete().catch((error: any) => {
                this.loggingComponent.error(error);
            });
    }

    /**
     * Replies to the user that no arguments was provided, but
     * it was necessary, with the proper command usage.
     *
     * @param {Message} message the Discord message which has the command
     * @param {Command} command the used Command
     */
    replyDidntProvideCommandArgs(message: Message, command: Command): void {
        const embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);

        embedMessage.setTitle("You didn't provide any arguments!");

        if (command.usage) {
            embedMessage.addField(
                "The proper usage would be:",
                `\`\`\`${this.dataComponent.getPrefix()}${command.name} ${
                    command.usage
                }\`\`\``,
                true
            );
        }

        message.channel
            .send({ embeds: [embedMessage] })
            .then((msg: Message) => this.deleteMsgTimeout(msg));
        this.deleteMsgNow(message);
    }

    /**
     * Return a base embed
     *
     * @returns {MessageEmbed} a base embedded message
     */
    buildBaseEmbed(): MessageEmbed {
        return new MessageEmbed().setColor(0x61b15a);
    }

    /**
     * Adds a simple footer to the embed message
     *
     * @param {Message} message the message to be edited
     * @param {MessageEmbed} embedMessage the edited embed message
     */
    addFooterToEmbed(message: Message, embedMessage: MessageEmbed): void {
        if (message.channel.type !== "DM" && message.member)
            embedMessage.setFooter(
                `${message.member.displayName}`,
                message.author.displayAvatarURL()
            );
        else
            embedMessage.setFooter(
                `${message.author.username}`,
                message.author.displayAvatarURL()
            );
    }

    /**
     * Reply's all commands to the user
     *
     * @param {Message} message the Discord message which requested all commands
     */
    helpSendAllCommands(message: Message): void {
        const embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);
        embedMessage.setTitle("Here's a list of all my commands:");
        if (this.bot.user) {
            embedMessage.setThumbnail(this.bot.user.displayAvatarURL());
        }
        const musicCommandsList: string[] = [];
        const soundEffectCommandsList: string[] = [];
        const utilityCommandsList: string[] = [];
        const otherCommandsList: string[] = [];

        this.commandComponent.commands.forEach(
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
                value: `\`\`\`${this.dataComponent.getPrefix()}help [command name]\`\`\``,
            }
        );

        message.author
            .send({ embeds: [embedMessage] })
            .then((msg: Message) => {
                this.reply(message, "I've sent you a DM with all my commands!");
                this.deleteMsgTimeout(msg);
            })
            .catch((error: any) => {
                this.loggingComponent.log(
                    `Could not send help DM to ${message.author.tag}.\n`
                );
                this.loggingComponent.error(error);
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
     */
    helpCommandUsage(message: Message, command: Command): void {
        const embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);

        embedMessage.setTitle("Here's the help for: " + command.name);

        if (this.bot.user) {
            embedMessage.setThumbnail(this.bot.user.displayAvatarURL());
        }
        embedMessage.addFields(
            {
                name: "Description",
                value: command.description,
            },
            {
                name: "Usage:",
                value: `\`\`\`${this.dataComponent.getPrefix()}${
                    command.name
                } ${command.usage}\`\`\``,
            }
        );

        message.channel
            .send({ embeds: [embedMessage] })
            .then((msg: Message) => this.deleteMsgTimeout(msg));
        this.deleteMsgNow(message);
    }
}
