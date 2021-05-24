const DataComponent = require("./components/core/DataComponent");
const ActivityDisplayComponent = require("./components/core/ActivityDisplayComponent");
const LoggingComponent = require("./components/core/LoggingComponent");
const MessageComponent = require("./components/core/MessageComponent");
const { Client, Message } = require("discord.js");
const Command = require("./commands/Command");

/**
 *  Main class for the Discord bot
 */
class Elia {
    /**
     * Setup's Elia with all the components.
     *
     * @param {Client} bot The Discord bot client
     * @param {DataComponent} dataComponent The data used by ELIA
     * @param {LoggingComponent} loggingComponent The component used for logging
     * @param {ActivityDisplayComponent} activityDisplayComponent The component used for displaying the current activity of ELIA
     * @param {MessageComponent} messageComponent The component used by ELIA for sending messages
     */
    constructor(
        bot,
        dataComponent,
        loggingComponent,
        activityDisplayComponent,
        messageComponent
    ) {
        /**
         * The Discord bot client
         *
         * @type {Client}
         */
        this.bot = bot;
        /**
         * The Map of the usable commands.
         *
         * @type {Map<string,Command>}
         */
        this.commandMap = new Map();

        // Add core components

        /**
         * The data used by ELIA
         *
         * @type {DataComponent}
         */
        this.dataComponent = dataComponent;
        /**
         * The component used for logging
         *
         * @type {LoggingComponent}
         */
        this.loggingComponent = loggingComponent;
        /**
         * The component used for displaying the current activity of ELIA
         *
         * @type {ActivityDisplayComponent}
         */
        this.activityDisplayComponent = activityDisplayComponent;
        /**
         * The component used by ELIA for sending messages
         *
         * @type {MessageComponent}
         */
        this.messageComponent = messageComponent;
    }

    /**
     * When the bot becomes ready, this you should call this function.
     */
    onReady() {
        this.activityDisplayComponent.setDefault();
        this.loggingComponent.log("E.L.I.A. is online!");
    }

    /**
     * Handle the received messages.
     *
     * @param {Message} message the Discord message the bot received
     * @returns {void}
     */
    onMessage(message) {
        try {
            // If the message doesn't starts with the prefix or the bot sent the message
            // we shouldn't process the message.
            if (
                !message.content.startsWith(this.dataComponent.getPrefix()) ||
                (message.author.bot && !this.dataComponent.getDevMode())
            )
                return;

            const args = message.content.substring(1).split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = this.commandMap.get(commandName);

            // If the command doesn't exists return
            if (command === undefined)
                return this.messageComponent.reply(
                    message,
                    "I can't understand that command!"
                );

            // Handle text origin(DM or guild)
            if (command.guildOnly && message.channel.type !== "text") {
                return this.messageComponent.reply(
                    message,
                    "I can't execute that command inside DMs!"
                );
            }

            // check if the command need arguments
            if (command.hasArguments && !args.length) {
                return this.messageComponent.replyDidntProvideCommandArgs(
                    message,
                    command
                );
            }

            // execute commands
            command.execute(message, args, this);
            // Handle every error, so the thread doesn't get blocked
        } catch (error) {
            this.loggingComponent.error(error);
            this.messageComponent.reply(
                message,
                "there was an error trying to execute that command!"
            );
        }
    }

    /**
     * Returns the bot's configured token.
     *
     * @returns {string} the bot's token
     */
    getToken() {
        return this.dataComponent.getToken();
    }

    /**
     * Log's all the currently avaliable commands via the loggingComponent
     */
    getAvaliableCommands() {
        let commands = "Avaliable commands: ";
        this.commandMap.forEach((e) => (commands += " " + e.name + ","));
        commands = commands.substring(0, commands.length - 1);
        this.loggingComponent.log(commands);
    }

    /**
     * Add's a component to ELIA
     *
     * @param {*} component the new component
     */
    addComponent(component) {
        component.init(this);
    }
}

module.exports = Elia;
