import { Message, MessageEmbed } from "discord.js";
import Command from "../../commands/Command";
import GuildProperties from "../../model/GuildProperties";
import LoggingComponent from "./LoggingComponent";

/**
 * Component that handles ELIA-s messages. Sends Discord embedded messages.
 */
export default class MessageComponent {
    constructor(
        /**
         * The component for logging
         *
         * @type {LoggingComponent}
         */
        private readonly loggingComponent: LoggingComponent
    ) {}

    /**
     * Replies to the message.
     *
     * @param {Message} message the Discord message to reply to
     * @param {string} answer the answer in string
     * @param {GuildProperties} props the properties of the guild which the message was sent
     * @param {?boolean} shouldDelete optional, determines to delete the message after the reply, default is true
     */
    reply(message: Message, answer: string, props: GuildProperties): void {
        const replyMsg = this.buildBaseEmbed().setTitle(answer);
        this.addFooterToEmbed(message, replyMsg);

        message.channel.send({ embeds: [replyMsg] }).then((msg: Message) => {
            this.deleteMsgTimeout(msg, props);
        });
    }

    /**
     * Deletes a message after a given time.
     *
     * @param {Message} message the Discord message to delete
     * @param {GuildProperties} props the properties of the guild which the message was sent
     */
    deleteMsgTimeout(message: Message, props: GuildProperties): void {
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
                props.messageDisplayTime
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
     * @param {GuildProperties} props the properties of the guild which the message was sent
     */
    replyDidntProvideCommandArgs(
        message: Message,
        command: Command,
        props: GuildProperties
    ): void {
        const embedMessage = this.buildBaseEmbed();
        this.addFooterToEmbed(message, embedMessage);

        embedMessage.setTitle("You didn't provide any arguments!");

        if (command.usage) {
            embedMessage.addField(
                "The proper usage would be:",
                `\`\`\`${props.prefix}${command.name} ${command.usage}\`\`\``,
                true
            );
        }

        message.channel
            .send({ embeds: [embedMessage] })
            .then((msg: Message) => this.deleteMsgTimeout(msg, props));
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
            embedMessage.setFooter({
                text: `${message.member?.displayName}`,
                iconURL: message.author.displayAvatarURL(),
            });
        else
            embedMessage.setFooter({
                text: `${message.author.username}`,
                iconURL: message.author.displayAvatarURL(),
            });
    }
}
