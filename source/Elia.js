const DataComponent = require("./components/data/DataComponent");
const ActivityDisplayComponent = require("./components/activity-display/ActivityDisplayComponent");
const LoggingComponent = require("./components/logging/LoggingComponent");
const MessageComponent = require("./components/message/MessageComponent");
const CommandComponent = require("./components/command/CommandComponent");
const MusicComponent = require("./components/music/MusicComponent");
const SoundEffectComponent = require("./components/sound-effect/SoundEffectComponent");

class Elia {
    /**
     * Setup's Elia with all the components.
     *
     * @param {*} bot The Discord bot client
     */
    constructor(bot) {
        /**
         * The Discord bot client
         */
        this.bot = bot;
        /**
         * The DataComponent for ELIA
         */
        this.dataComponent = new DataComponent();
        /**
         * The LoggingComponent for ELIA
         */
        this.loggingComponent = new LoggingComponent();
        this.loggingComponent.log(
            "------------------------\nElia is starting!\n------------------------"
        );
        /**
         * The ActivityDisplayComponent for ELIA
         */
        this.activityDisplayComponent = new ActivityDisplayComponent(
            this.bot,
            this.dataComponent
        );
        /**
         * The MessageComponent for ELIA
         */
        this.messageComponent = new MessageComponent(this);
        /**
         * The Map of the usable commands.
         */
        this.commandMap = new Map();
        /**
         * The CommandComponent for ELIA witch adds basic commands
         */
        this.commandComponent = new CommandComponent(
            this.commandMap,
            this.loggingComponent
        );
        /**
         * The MusicComponent for ELIA witch add the music commands
         */
        this.musicComponent = new MusicComponent(this);
        /**
         * The SoundEffectComponent for ELIA witch adds sound effect commands
         */
        this.soundEffectComponent = new SoundEffectComponent(
            this.commandMap,
            this.loggingComponent
        );
        this.loggingComponent.log(
            "------------\nAvaliable commands:\n------------"
        );
        this.commandMap.forEach((e) => this.loggingComponent.log(e.name));
    }

    /**
     * When the bot becomes ready, this you should call this function.
     */
    onReady() {
        this.activityDisplayComponent.setDefault();
        this.loggingComponent.log(
            "------------------------\nE.L.I.A. is online!\n------------------------"
        );
    }

    /**
     * Handle the received messages.
     *
     * @param {*} message the Discord message the bot received
     */
    onMessage(message) {
        try {
            // If the message doesn't starts with the prefix or the bot sent the message
            // we shouldn't process the message.
            if (
                !message.content.startsWith(this.dataComponent.getPrefix()) ||
                message.author.bot
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
            command.execute(message, args, this).then((_args) => {
                if (command.shouldDelete && message)
                    message.delete({
                        timeout: this.dataComponent.getMessageDisplayTime(),
                    });
            });
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
     */
    getToken() {
        return this.dataComponent.getToken();
    }
}

module.exports = Elia;
