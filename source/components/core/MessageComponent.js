const Discord = require("discord.js");
const ms = require("ms");
const CommandTypeEnum = require("../../commands/CommandTypeEnum");
class MessageComponent {
    constructor(bot, dataComponent, loggingComponent) {
        this.bot = bot;
        this.dataComponent = dataComponent;
        this.loggingComponent = loggingComponent;
    }

    /**
     * Replies to the message.
     *
     * @param {*} message the Discord message
     * @param {*} answer the answer in string
     */
    reply(message, answer) {
        let replyMsg = this.buildBaseEmbed().setTitle(answer);
        this.addFooterToEmbed(message, replyMsg);

        message.reply(replyMsg).then((msg) => {
            this.deleteMsgTimeout(msg);
        });
        this.deleteMsgNow(message);
    }

    deleteMsgTimeout(msg) {
        if (msg && !msg.deleted && msg.deletable && msg.channel.type !== "dm")
            msg.delete({
                timeout: this.dataComponent.getMessageDisplayTime(),
            }).catch((error) => {
                console.log(error);
            });
    }

    deleteMsgNow(msg) {
        if (msg && !msg.deleted && msg.deletable && msg.channel.type !== "dm")
            msg.delete().catch((error) => {
                console.log(error);
            });
    }

    /**
     * Replies to the user that no arguments was provided, but
     * it was necessary, with the proper command ussage.
     *
     * @param {*} message the Discord message
     * @param {*} command the command object
     */
    replyDidntProvideCommandArgs(message, command) {
        let embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);

        embedMessage.setTitle(`You didn't provide any arguments!`);

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

    buildBaseEmbed() {
        return new Discord.MessageEmbed().setColor(0x61b15a);
    }

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

    helpSendAllCommands(message, elia) {
        let embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);
        embedMessage.setTitle("Here's a list of all my commands:");
        embedMessage.setThumbnail(this.bot.user.displayAvatarURL());

        let musicCommandsList = [];
        let soundEffectCommandsList = [];
        let utilityCommandsList = [];
        let otherCommandsList = [];

        elia.commandMap.forEach((element) => {
            switch (element.type) {
                case CommandTypeEnum.MUSIC:
                    musicCommandsList.push(element.name);
                    break;
                case CommandTypeEnum.SOUNDEFFECT:
                    soundEffectCommandsList.push(element.name);
                    break;
                case CommandTypeEnum.UTILITY:
                    utilityCommandsList.push(element.name);
                    break;
                case CommandTypeEnum.OTHER:
                    otherCommandsList.push(element.name);
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
                name:
                    "Use the command below to get info on a specific command!",
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
