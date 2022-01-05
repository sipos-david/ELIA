import ActivityDisplayComponent from "./components/core/ActivityDisplayComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import { Client, Message } from "discord.js";
import Command from "./commands/Command";
import EliaInstance from "./EliaInstance";
import YoutubeService from "./services/YoutubeService";
import config from "./config.json";
import GuildProperties, { FlatGuildProperties } from "./model/GuildProperties";
import MusicComponent from "./components/music/MusicComponent";
import AudioComponent from "./components/AudioComponent";

/**
 *  Main class for the Discord bot
 */
export default class Elia {
    /**
     * Setup's Elia with all the components.
     *
     * @param {Client} bot The Discord bot client
     * @param {LoggingComponent} loggingComponent The component used for logging
     * @param {ActivityDisplayComponent} activityDisplayComponent The component used for displaying the current activity of ELIA
     * @param {MessageComponent} messageComponent The component used by ELIA for sending message
     * @param {YoutubeService} youtubeService The service for Youtube
     */
    constructor(
        private readonly bot: Client,
        private readonly loggingComponent: LoggingComponent,
        private readonly activityDisplayComponent: ActivityDisplayComponent,
        private readonly messageComponent: MessageComponent,
        private readonly youtubeService: YoutubeService
    ) {
        // Add core components
        // Generate instances
        this.generateInstances();
    }

    private readonly _commands: Map<string, Command> = new Map();
    private readonly instances: Map<string, EliaInstance> = new Map();

    private readonly DEFAULT_INSTANCE = "default";

    get commands(): Map<string, Command> {
        return this._commands;
    }

    /**
     * When the bot becomes ready, this you should call this function.
     */
    onReady(): void {
        this.activityDisplayComponent.setDefault();
        this.loggingComponent.log("E.L.I.A. is online!");
    }

    /**
     * Handle the received messages.
     *
     * @param {Message} message the Discord message the bot received
     * @returns {void}
     */
    onMessage(message: Message): void {
        const guildId = message.guild?.id;
        if (guildId) {
            this.handleMessage(message, guildId);
        } else if (message.channel.type === "DM") {
            this.handleMessage(message, this.DEFAULT_INSTANCE);
        }
    }

    handleMessage(message: Message, instanceId: string) {
        const instance = this.instances.get(instanceId);
        if (instance !== undefined) {
            // If the message doesn't starts with the prefix or the bot sent the message
            // we shouldn't process the message.
            if (
                !message.content.startsWith(instance.properties.prefix) ||
                (message.author.bot && !instance.properties.modes.isDev)
            )
                return;

            const args = message.content.substring(1).split(/ +/);
            const commandRawString = args.shift();

            if (commandRawString) {
                const commandName = commandRawString.toLowerCase();
                this.handleCommand(message, commandName, args, instance);
            }
        }
    }

    private handleCommand(
        message: Message,
        commandName: string,
        args: string[],
        instance: EliaInstance
    ) {
        const command = this.commands.get(commandName);

        // If the command doesn't exists return
        if (command === undefined)
            return this.messageComponent.reply(
                message,
                "I can't understand that command!",
                instance.properties
            );

        // Handle text origin(DM or guild)
        if (command.guildOnly && message.channel.type === "DM") {
            return this.messageComponent.reply(
                message,
                "I can't execute that command inside DMs!",
                instance.properties
            );
        }

        // check if the command need arguments
        if (command.hasArguments && !args.length) {
            return this.messageComponent.replyDidntProvideCommandArgs(
                message,
                command,
                instance.properties
            );
        }

        try {
            // execute commands
            command.execute(message, args, instance);
            if (command.shouldDelete) {
                this.messageComponent.deleteMsgNow(message);
            }

            // Handle every error, so the thread doesn't get blocked
        } catch (error) {
            this.loggingComponent.error(error);
            this.messageComponent.reply(
                message,
                "There was an error trying to execute that command!",
                instance.properties
            );
        }
    }

    /**
     * Log's all the currently available commands via the loggingComponent
     */
    getAvailableCommands(): void {
        let commands = "Available commands: ";
        this.commands.forEach((e) => (commands += " " + e.name + ","));
        commands = commands.substring(0, commands.length - 1);
        this.loggingComponent.log(commands);
    }

    /**
     * Add commands to ELIA
     *
     * @param {Command} commands the commands to add to ELIA
     */
    addCommands(commands: Command[]): void {
        commands.forEach((cmd) => this._commands.set(cmd.name, cmd));
    }

    private generateInstances(): void {
        config.guilds.forEach((guild) => {
            const instance = this.createInstance(
                this.createGuildProperties(guild as FlatGuildProperties)
            );
            this.instances.set(guild.id, instance);
        });
        const defaultInstance = this.createInstance(
            this.createDefaultProperties()
        );
        this.instances.set(this.DEFAULT_INSTANCE, defaultInstance);
    }

    private createInstance(props: GuildProperties): EliaInstance {
        const audioComponent = new AudioComponent(
            props,
            this.youtubeService,
            this.loggingComponent,
            this.bot
        );
        const musicComponent = new MusicComponent(
            props,
            this.bot,
            this.youtubeService,
            this.activityDisplayComponent,
            this.messageComponent,
            this.loggingComponent,
            audioComponent
        );
        return new EliaInstance(
            this.bot,
            this.messageComponent,
            this.loggingComponent,
            props,
            musicComponent,
            audioComponent
        );
    }

    private createGuildProperties(guild: FlatGuildProperties): GuildProperties {
        return {
            prefix: guild.prefix ? guild.prefix : config.defaults.prefix,
            musicVolume: guild.musicVolume
                ? +guild.musicVolume
                : +config.defaults.musicVolume,
            messageDisplayTime: guild.messageDisplayTime
                ? +guild.messageDisplayTime
                : +config.defaults.messageDisplayTime,
            modes: {
                isDev: guild.devMode ? guild.devMode : config.defaults.devMode,
                isRadio: guild.radioMode
                    ? guild.radioMode
                    : config.defaults.radioMode,
            },
            channels: {
                radioId: guild.radioChannelID,
                botSpamId: guild.botSpamChannelID,
                memeId: guild.memeTextChannelID,
                pinId: guild.pinTextChannelID,
            },
        };
    }

    private createDefaultProperties(): GuildProperties {
        return {
            prefix: config.defaults.prefix,
            musicVolume: +config.defaults.musicVolume,
            messageDisplayTime: +config.defaults.messageDisplayTime,
            modes: {
                isDev: config.defaults.devMode,
                isRadio: config.defaults.radioMode,
            },
            channels: {
                radioId: undefined,
                botSpamId: undefined,
                memeId: undefined,
                pinId: undefined,
            },
        };
    }
}
