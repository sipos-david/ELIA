const Discord = require("discord.js");
const CommandTypeEnum = require("../../commands/CommandTypeEnum");
class MessageComponent {
    constructor(elia) {
        this.elia = elia;
    }

    /**
     * Replies to the message.
     *
     * @param {*} message the Discord message
     * @param {*} answer the answer in string
     */
    reply(message, answer) {
        message.reply(this.buildBaseEmbed().setTitle(answer)).then((msg) => {
            this.deleteMsgTimeout(msg);
        });
        this.deleteMsgNow(message);
    }

    deleteMsgTimeout(msg) {
        if (msg && !msg.deleted && msg.deletable && msg.channel.type !== "dm")
            msg.delete({
                timeout: this.elia.dataComponent.getMessageDisplayTime(),
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

        embedMessage.setTitle(`You didn't provide any arguments!`);

        embedMessage.setFooter(
            `${message.author.tag}.`,
            message.author.displayAvatarURL()
        );

        if (command.usage) {
            embedMessage.addField(
                "The proper usage would be:",
                `\`\`\`${this.elia.dataComponent.getPrefix()}${command.name} ${
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

    helpSendAllCommands(message) {
        let embedMessage = this.buildBaseEmbed();

        embedMessage.setTitle("Here's a list of all my commands:");

        embedMessage.setThumbnail(this.elia.bot.user.displayAvatarURL());

        let musicCommandsList = [];
        let soundEffectCommandsList = [];
        let utilityCommandsList = [];
        let otherCommandsList = [];

        this.elia.commandMap.forEach((element) => {
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
                value: `\`\`\`${this.elia.dataComponent.getPrefix()}help [command name]\`\`\``,
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
                this.elia.loggingComponent.error(
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

        embedMessage.setTitle("Here's the help for: " + command.name);

        embedMessage.setThumbnail(this.elia.bot.user.displayAvatarURL());

        embedMessage.addFields(
            {
                name: "Description",
                value: command.description,
            },
            {
                name: "Usage:",
                value: `\`\`\`${this.elia.dataComponent.getPrefix()}${
                    command.name
                } ${command.usage}\`\`\``,
            }
        );

        message.channel.send(embedMessage).then((msg) => this.deleteMsg(msg));
        this.deleteMsgTimeout(embedMessage);
    }
}

module.exports = MessageComponent;
