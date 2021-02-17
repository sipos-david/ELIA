class MessageComponent {
    constructor(dataComponent) {
        this.dataComponent = dataComponent;
    }

    /**
     * Replies to the message.
     *
     * @param {*} message the Discord message
     * @param {*} answer the answer in string
     */
    reply(message, answer) {
        message.reply(answer);
    }

    /**
     * Replies to the user that no arguments was provided, but
     * it was necessary, with the proper command ussage.
     *
     * @param {*} message the Discord message
     * @param {*} command the command object
     */
    replyDidntProvideCommandArgs(message, command) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${this.dataComponent.getPrefix()}${
                command.name
            } ${command.usage}\``;
        }

        message.channel.send(reply);
    }
}

module.exports = MessageComponent;
