import { Client, Message, VoiceChannel, VoiceConnection } from "discord.js";
import DataComponent from "../core/DataComponent";
import LoggingComponent from "../core/LoggingComponent";
import MessageComponent from "../core/MessageComponent";
import MusicComponent from "./MusicComponent";
import MusicData from "./MusicData";
import YoutubeService from "./YoutubeService";

/**
 * Class for handling Discord.js voice connections
 */
export default class MusicPlayer {
    constructor(
        dataComponent: DataComponent,
        loggingComponent: LoggingComponent,
        messageComponent: MessageComponent,
        youtubeService: YoutubeService,
        bot: Client
    ) {
        this.youtubeService = youtubeService;
        this.dataComponent = dataComponent;
        this.messageComponent = messageComponent;
        this.loggingComponent = loggingComponent;
        this.bot = bot;
    }

    private youtubeService: YoutubeService;
    private loggingComponent: LoggingComponent;
    private dataComponent: DataComponent;
    private messageComponent: MessageComponent;
    private bot: Client;

    /**
     * The joined voice channel, null if not joined any
     *
     * @type {?VoiceChannel}
     */
    voiceChannel: VoiceChannel | null = null;

    /**
     * The joined voice channel, null if not joined any
     *
     * @type {?VoiceConnection}
     */
    connection: VoiceConnection | null = null;

    /**
     * Get the voice channel from message, if config not available, falls back to function parameter
     *
     * @param {VoiceChannel} voiceChannel the voice channel the user is in
     * @param {Message} message the message that has the music command
     * @returns {?VoiceChannel} the new music voice channel
     */
    async getVoiceChannel(
        voiceChannel: VoiceChannel,
        message: Message
    ): Promise<VoiceChannel> {
        if (this.dataComponent.getRadioMode() && message.guild) {
            const radioChannel = this.dataComponent.getRadioChannel(
                message.guild.id
            );
            if (radioChannel) {
                const radioVoiceChannel =
                    this.bot.channels.cache.get(radioChannel);
                if (radioVoiceChannel) {
                    if (radioVoiceChannel instanceof VoiceChannel) {
                        return radioVoiceChannel;
                    }
                } else {
                    this.messageComponent.reply(
                        message,
                        "Radio channel not available for current server!"
                    );
                }
            }
            return voiceChannel;
        } else {
            return voiceChannel;
        }
    }

    /**
     * Check's if the bot is playing songs to itself.
     *
     * @returns {boolean} true if the bot is alone in the VoiceChannel, else false
     */
    hasMembersInVoice(): boolean {
        if (
            this.voiceChannel != null &&
            this.bot.user &&
            this.voiceChannel.members.has(this.bot.user.id) &&
            this.voiceChannel.members.size == 1 &&
            !this.dataComponent.getRadioMode()
        ) {
            this.loggingComponent.log("Elia was left alone...");
            return false;
        } else return true;
    }

    /**
     * Get the volume number from message
     *
     * @param {?Message} message a Discord message
     * @returns {number} the volume number
     */
    getMusicVolume(message: Message | undefined): number {
        let vol: string;

        if (message && message.guild) {
            vol = this.dataComponent.getMusicVolume(message.guild.id);
        } else {
            vol = this.dataComponent.getMusicVolume(undefined);
        }
        return parseFloat(vol);
    }

    /**
     * Plays a song
     *
     * @param {?Message} message a Discord message
     * @param {VoiceConnection} connection a Discord connection
     * @param {MusicData} song the song to be played
     * @param {MusicComponent} musicComponent the music component that requested to play a song
     */
    play(
        message: Message | undefined,
        connection: VoiceConnection,
        song: MusicData,
        musicComponent: MusicComponent
    ): void {
        const stream = this.youtubeService.getStreamFromUrl(song.url);
        connection
            .play(stream, {
                seek: 0,
                volume: this.getMusicVolume(message),
            })
            .on("finish", () => {
                musicComponent.continuePlayingMusic();
            });

        if (message) {
            if (song.title) {
                this.messageComponent.reply(
                    message,
                    ":musical_note: Now Playing ***" +
                        song.title +
                        "*** at ***" +
                        song.url +
                        "***"
                );
            } else {
                this.messageComponent.reply(
                    message,
                    ":musical_note: Now Playing ***" + song.url + "***"
                );
            }
            this.loggingComponent.log(
                message.author.username + " played: " + song.url
            );
        }
    }
}
