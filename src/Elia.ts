import ActivityDisplayComponent from "./components/core/ActivityDisplayComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import {
    CacheType,
    Client,
    CommandInteraction,
    Guild,
    Interaction,
    Message,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import Command from "./commands/Command";
import EliaInstance from "./EliaInstance";
import YoutubeService from "./services/YoutubeService";
import config from "./config.json";
import GuildProperties, { FlatGuildProperties } from "./model/GuildProperties";
import MusicComponent from "./components/music/MusicComponent";
import AudioComponent from "./components/AudioComponent";
import CommandCallSource, {
    InteractionCallSource,
    MessageCallSource,
} from "./model/CommandCallSource";
import { SlashCommandBuilder } from "@discordjs/builders";

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
     * @param {YoutubeService} youtubeService The service for Youtube
     */
    constructor(
        private readonly bot: Client,
        private readonly loggingComponent: LoggingComponent,
        private readonly activityDisplayComponent: ActivityDisplayComponent,
        private readonly youtubeService: YoutubeService
    ) {
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

    onInteraction(interaction: Interaction<CacheType>) {
        if (!interaction.isCommand() || !interaction.guildId) return;

        if (interaction.guildId) {
            this.handleInteraction(interaction, interaction.guildId);
        } else if (interaction?.channel?.type === "DM") {
            this.handleInteraction(interaction, this.DEFAULT_INSTANCE);
        }
    }

    handleInteraction(
        interaction: CommandInteraction<CacheType>,
        instanceId: string
    ): void {
        const instance = this.instances.get(instanceId);
        if (instance !== undefined) {
            const args: string[] = [];

            interaction.options.data.forEach((item) => {
                if (item.value) {
                    args.push(item.value.toString());
                }
            });

            this.handleCommand(
                new InteractionCallSource(interaction),
                interaction.commandName,
                args,
                instance
            );
        }
    }

    handleMessage(message: Message, instanceId: string): void {
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
                this.handleCommand(
                    new MessageCallSource(message),
                    commandName,
                    args,
                    instance
                );
            }
        }
    }

    private handleCommand(
        commandSource: CommandCallSource,
        commandName: string,
        args: string[],
        instance: EliaInstance
    ) {
        const command = this.commands.get(commandName);

        // If the command doesn't exists return
        if (command === undefined)
            return instance.messageComponent.reply(
                commandSource,
                "I can't understand that command!"
            );

        // Handle text origin(DM or guild)
        if (command.guildOnly && commandSource.channel?.type === "DM") {
            return instance.messageComponent.reply(
                commandSource,
                "I can't execute that command inside DMs!"
            );
        }

        // check if the command need arguments
        if (command.hasArguments && !args.length) {
            return instance.messageComponent.replyDidntProvideCommandArgs(
                commandSource,
                command
            );
        }

        try {
            // execute commands
            command.execute(commandSource, args, instance);
            if (command.shouldDelete) {
                commandSource.deleteWith(instance.messageComponent);
            }

            // Handle every error, so the thread doesn't get blocked
        } catch (error) {
            this.loggingComponent.error(error);
            instance.messageComponent.reply(
                commandSource,
                "There was an error trying to execute that command!"
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

    private getSlashCommands(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
    >[] {
        const slashCommands: Omit<
            SlashCommandBuilder,
            "addSubcommand" | "addSubcommandGroup"
        >[] = [];

        this.commands.forEach((command) =>
            slashCommands.push(command.createSlashCommandData())
        );

        return slashCommands;
    }

    private getRest(token: string): REST {
        return new REST({ version: "9" }).setToken(token);
    }

    public async refreshSlashCommands(token: string, clientId: string) {
        const rest = this.getRest(token);
        try {
            this.loggingComponent.log(
                "Started refreshing application (/) commands."
            );

            const slashCommands = this.getSlashCommands();

            config.guilds.forEach(async (guild) => {
                this.addSlashCommandsToGuild(
                    token,
                    clientId,
                    guild,
                    rest,
                    slashCommands
                );
            });
        } catch (error) {
            this.loggingComponent.error(error);
        }
    }

    private async addSlashCommandsToGuild(
        token: string,
        clientId: string,
        guild: {
            id: string;
        },
        rest: REST | undefined = undefined,
        slashCommands:
            | Omit<
                  SlashCommandBuilder,
                  "addSubcommand" | "addSubcommandGroup"
              >[]
            | undefined = undefined
    ) {
        if (!rest) {
            rest = this.getRest(token);
        }
        if (!slashCommands) {
            slashCommands = this.getSlashCommands();
        }
        try {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guild.id),
                { body: slashCommands }
            );
            this.loggingComponent.log("(/) commands added to: " + guild.id);
        } catch (error) {
            this.loggingComponent.error(
                "Failed adding (/) commands added to: " + guild.id
            );
            this.loggingComponent.error(error);
        }
    }

    onJoinGuild(token: string, clientId: string, guild: Guild): void {
        const guilds = config.guilds as unknown[];
        guilds.push({ id: guild.id });
        this.loggingComponent.log("Joined guild: " + guild.id);
        this.addSlashCommandsToGuild(token, clientId, guild);
        const instance = this.createInstance(
            this.createGuildProperties({
                id: guild.id,
                prefix: undefined,
                devMode: undefined,
                radioMode: undefined,
                musicVolume: undefined,
                messageDisplayTime: undefined,
                pinTextChannelID: undefined,
                memeTextChannelID: undefined,
                musicControlTextChannelID: undefined,
                botSpamChannelID: undefined,
                radioChannelID: undefined,
            })
        );
        this.instances.set(guild.id, instance);
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
        const messageComponent = new MessageComponent(
            props,
            this.loggingComponent
        );

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
            messageComponent,
            this.loggingComponent,
            audioComponent
        );
        return new EliaInstance(
            this.bot,
            this.loggingComponent,
            props,
            messageComponent,
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
