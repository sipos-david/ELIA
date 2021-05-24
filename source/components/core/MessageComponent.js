const { Client, Message, MessageEmbed } = require("discord.js");
const Command = require("../../commands/Command");
const CommandTypeEnum = require("../../commands/CommandTypeEnum");
const Elia = require("../../Elia");
const DataComponent = require("./DataComponent");
const LoggingComponent = require("./LoggingComponent");

/**
 * Component that handles ELIA-s messages. Sends Discord embedded messages.
 */
class MessageComponent {
    constructor(bot, dataComponent, loggingComponent) {
        /**
         * The Discord Client
         *
         * @type {Client}
         */
        this.bot = bot;
        /**
         * The component for data
         *
         * @type {DataComponent}
         */
        this.dataComponent = dataComponent;
        /**
         * The component for logging
         *
         * @type {LoggingComponent}
         */
        this.loggingComponent = loggingComponent;
    }

    /**
     * Replies to the message.
     *
     * @param {Message} message the Discord message to reply to
     * @param {string} answer the answer in string
     */
    reply(message, answer) {
        let replyMsg = this.buildBaseEmbed().setTitle(answer);
        this.addFooterToEmbed(message, replyMsg);

        message.reply(replyMsg).then((msg) => {
            this.deleteMsgTimeout(msg);
        });
        this.deleteMsgNow(message);
    }

    /**
     * Deletes a message after a given time.
     *
     * @param {Message} message the Discord message to delete
     */
    deleteMsgTimeout(message) {
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
                .catch((error) => {
                    this.loggingComponent.error(error);
                });
    }

    /**
     * Deletes a message instantly.
     *
     * @param {Message} message the Discord message to delete
     */
    deleteMsgNow(message) {
        if (
            message &&
            !message.deleted &&
            message.deletable &&
            message.channel.type !== "dm"
        )
            message.delete().catch((error) => {
                this.loggingComponent.error(error);
            });
    }

    /**
     * Replies to the user that no arguments was provided, but
     * it was necessary, with the proper command ussage.
     *
     * @param {Message} message the Discord message which has the command
     * @param {Command} command the used Command
     */
    replyDidntProvideCommandArgs(message, command) {
        let embedMessage = this.buildBaseEmbed();
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
            .then((msg) => this.deleteMsgTimeout(msg));
        this.deleteMsgNow(message);
    }

    /**
     * Return a base embed
     *
     * @returns {MessageEmbed} a base embedded message
     */
    buildBaseEmbed() {
        return new MessageEmbed().setColor(0x61b15a);
    }

    /**
     * Add's a simple footer to the embed message
     *
     * @param {MessageEmbed} message the message to be edited
     * @param {MessageEmbed} embedMessage the edited embed message
     */
    addFooterToEmbed(message, embedMessage) {
        if (message.channel.type !== "dm")
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
    helpSendAllCommands(message, elia) {
        let embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);
        embedMessage.setTitle("Here's a list of all my commands:");
        embedMessage.setThumbnail(this.bot.user.displayAvatarURL());

        let musicCommandsList = [];
        let soundEffectCommandsList = [];
        let utilityCommandsList = [];
        let otherCommandsList = [];

        elia.commandMap.forEach((command) => {
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
            .then((msg) => {
                this.reply(message, "I've sent you a DM with all my commands!");
                this.deleteMsgNow(msg);
                this.deleteMsgTimeout(embedMessage);
            })
            .catch((error) => {
                this.loggingComponent.error(
                    `Could not send help DM to ${message.author.tag}.\n`,
                    error
                );
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
    helpCommandUsage(message, command) {
        let embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);

        embedMessage.setTitle("Here's the help for: " + command.name);

        embedMessage.setThumbnail(this.bot.user.displayAvatarURL());

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
            .then((msg) => this.deleteMsgTimeout(msg));
        this.deleteMsgNow(message);
    }
}

module.exports = MessageComponent;
