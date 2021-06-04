import DataComponent from "./components/core/DataComponent";
import ActivityDisplayComponent from "./components/core/ActivityDisplayComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import { Client, Message } from "discord.js";
import MusicComponent from "./components/music/MusicComponent";
import CommandComponent from "./components/CommandComponent";

/**
 *  Main class for the Discord bot
 */
export default class Elia {
    /**
     * Setup's Elia with all the components.
     *
     * @param {Client} bot The Discord bot client
     * @param {DataComponent} dataComponent The data used by ELIA
     * @param {LoggingComponent} loggingComponent The component used for logging
     * @param {ActivityDisplayComponent} activityDisplayComponent The component used for displaying the current activity of ELIA
     * @param {MessageComponent} messageComponent The component used by ELIA for sending message
     * @param {CommandComponent} commandComponent The component used by ELIA for commands
     * @param {?MessageComponent} musicComponent The component used by ELIA for playing music
     */
    constructor(
        bot: Client,
        dataComponent: DataComponent,
        loggingComponent: LoggingComponent,
        activityDisplayComponent: ActivityDisplayComponent,
        messageComponent: MessageComponent,
        commandComponent: CommandComponent,
        musicComponent: MusicComponent | undefined
    ) {
        this.bot = bot;
        // Add core components
        this.commandComponent = commandComponent;
        this.dataComponent = dataComponent;
        this.loggingComponent = loggingComponent;
        this.activityDisplayComponent = activityDisplayComponent;
        this.messageComponent = messageComponent;
        // Add optional components
        this.musicComponent = musicComponent;
    }

    /**
     * The Discord bot client
     *
     * @type {Client}
     */
    bot: Client;

    /**
     * The component used for commands
     *
     * @type {CommandComponent}
     */
    commandComponent: CommandComponent;

    /**
     * The data used by ELIA
     *
     * @type {DataComponent}
     */
    dataComponent: DataComponent;

    /**
     * The component used for logging
     *
     * @type {LoggingComponent}
     */
    loggingComponent: LoggingComponent;

    /**
     * The component used for displaying the current activity of ELIA
     *
     * @type {ActivityDisplayComponent}
     */
    activityDisplayComponent: ActivityDisplayComponent;

    /**
     * The component used by ELIA for sending messages
     *
     * @type {MessageComponent}
     */
    messageComponent: MessageComponent;

    /**
     * The component used by ELIA for playing music
     *
     * @type {MessageComponent}
     */
    musicComponent: MusicComponent | undefined;

    /**
     * When the bot becomes ready, this you should call this function.
     */
    onReady(): void {
        this.activityDisplayComponent.setDefault();
        const version = this.dataComponent.getVersion();
        this.loggingComponent.log("E.L.I.A. " + version + " is online!");
    }

    /**
     * Handle the received messages.
     *
     * @param {Message} message the Discord message the bot received
     * @returns {void}
     */
    onMessage(message: Message): void {
        try {
            // If the message doesn't starts with the prefix or the bot sent the message
            // we shouldn't process the message.
            if (
                !message.content.startsWith(this.dataComponent.getPrefix()) ||
                (message.author.bot && !this.dataComponent.getDevMode())
            )
                return;

            const args = message.content.substring(1).split(/ +/);
            const commandRawString = args.shift();
            if (commandRawString) {
                const commandName = commandRawString.toLowerCase();
                const command = this.commandComponent.commands.get(commandName);

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
            }
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
     * Returns the bots configured token.
     *
     * @returns {string} the bots token
     */
    getToken(): string {
        return this.dataComponent.getToken();
    }

    /**
     * Log's all the currently available commands via the loggingComponent
     */
    getAvailableCommands(): void {
        let commands = "Available commands: ";
        this.commandComponent.commands.forEach(
            (e) => (commands += " " + e.name + ",")
        );
        commands = commands.substring(0, commands.length - 1);
        this.loggingComponent.log(commands);
    }
}
