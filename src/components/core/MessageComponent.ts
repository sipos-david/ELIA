import { Client, Message, MessageEmbed } from "discord.js";
import Command from "../../commands/Command";
import { CommandTypeEnum } from "../../commands/CommandTypeEnum";
import Elia from "../../Elia";
import DataComponent from "./DataComponent";
import LoggingComponent from "./LoggingComponent";

/**
 * Component that handles ELIA-s messages. Sends Discord embedded messages.
 */
export default class MessageComponent {
    constructor(
        bot: Client,
        dataComponent: DataComponent,
        loggingComponent: LoggingComponent
    ) {
        this.bot = bot;
        this.dataComponent = dataComponent;
        this.loggingComponent = loggingComponent;
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
     * Replies to the message.
     *
     * @param {Message} message the Discord message to reply to
     * @param {string} answer the answer in string
     */
    reply(message: Message, answer: string): void {
        const replyMsg = this.buildBaseEmbed().setTitle(answer);
        this.addFooterToEmbed(message, replyMsg);

        message.reply(replyMsg).then((msg: Message) => {
            this.deleteMsgTimeout(msg);
        });
        this.deleteMsgNow(message);
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
            message.channel.type !== "dm"
        )
            message
                .delete({
                    timeout: this.dataComponent.getMessageDisplayTime(),
                })
                .catch((error: any) => {
                    this.loggingComponent.error(error);
                });
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
            message.channel.type !== "dm"
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
            .send(embedMessage)
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
        if (message.channel.type !== "dm" && message.member)
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
     * @param {Elia} elia the Elia object which got the request
     */
    helpSendAllCommands(message: Message, elia: Elia): void {
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

        elia.commandMap.forEach((command: { type: CommandTypeEnum; name: string }) => {
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
        });

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
            .send(embedMessage)
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
            .send(embedMessage)
            .then((msg: Message) => this.deleteMsgTimeout(msg));
        this.deleteMsgNow(message);
    }
}
