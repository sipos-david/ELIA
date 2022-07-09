import { Message, MessageEmbed } from "discord.js";
import Command from "../../commands/Command";
import CommandCallSource from "../../model/CommandCallSource";
import GuildProperties from "../../model/GuildProperties";
import LoggingComponent from "./LoggingComponent";

/**
 * Component that handles ELIA-s messages. Sends Discord embedded messages.
 */
export default class MessageComponent {
    constructor(
        private readonly properties: GuildProperties,
        /**
         * The component for logging
         *
         * @type {LoggingComponent}
         */
        private readonly loggingComponent: LoggingComponent,
    ) { }

    /**
     * Replies to the message.
     *
     * @param {CommandCallSource} source the call source
     * @param {string} answer the answer in string
     */
    reply(source: CommandCallSource, answer: string): void {
        const replyMsg = this.buildBaseEmbed().setTitle(answer);
        this.addFooterToEmbed(source, replyMsg);

        const channel = source.channel;
        if (channel) {
            source.reply(replyMsg).then((msg: Message | void) => {
                if (msg instanceof Message) {
                    this.deleteMsgTimeout(msg);
                }
            });
        }
    }

    /**
     * Deletes a message after a given time.
     *
     * @param {Message} message the Discord message to delete
     */
    deleteMsgTimeout(message: Message): void {
        if (message && message.deletable && message.channel.type !== "DM") {
            setTimeout(
                () =>
                    message.delete().catch((error: unknown) => {
                        this.loggingComponent.error(error);
                    }),
                this.properties.messageDisplayTime,
            );
        }
    }

    /**
     * Deletes a message instantly.
     *
     * @param {Message} message the Discord message to delete
     */
    deleteMsgNow(message: Message): void {
        if (message && message.deletable && message.channel.type !== "DM") {
            message.delete().catch((error: unknown) => {
                this.loggingComponent.error(error);
            });
        }
    }

    /**
     * Replies to the user that no arguments was provided, but
     * it was necessary, with the proper command usage.
     *
     * @param {CommandCallSource} source the Discord message which has the command
     * @param {Command} command the used Command
     */
    replyDidntProvideCommandArgs(
        source: CommandCallSource,
        command: Command,
    ): void {
        const embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(source, embedMessage);

        embedMessage.setTitle("You didn't provide any arguments!");

        if (command.usage) {
            embedMessage.addField(
                "The proper usage would be:",
                `\`\`\`${this.properties.prefix}${command.name} ${command.usage}\`\`\``,
                true,
            );
        }

        const channel = source.channel;
        if (channel) {
            source.channel
                .send({ embeds: [embedMessage] })
                .then((msg: Message) => this.deleteMsgTimeout(msg));
        }
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
     * @param {CommandCallSource} source the caller of the command
     * @param {MessageEmbed} embedMessage the edited embed message
     */
    addFooterToEmbed(
        source: CommandCallSource,
        embedMessage: MessageEmbed,
    ): void {
        if (source.channel?.type !== "DM" && source.member) {
            embedMessage.setFooter({
                text: `${source.member?.displayName}`,
                iconURL: source.user.displayAvatarURL(),
            });
        } else {
            embedMessage.setFooter({
                text: `${source.user.username}`,
                iconURL: source.user.displayAvatarURL(),
            });
        }
    }
}
