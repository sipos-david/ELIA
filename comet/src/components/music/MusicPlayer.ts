import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    joinVoiceChannel,
    NoSubscriberBehavior,
    demuxProbe,
    DiscordGatewayAdapterCreator,
} from "@discordjs/voice";
import { Client, Message, VoiceChannel } from "discord.js";
import internal from "stream";
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
        musicComponent: MusicComponent,
        bot: Client
    ) {
        this.youtubeService = youtubeService;
        this.dataComponent = dataComponent;
        this.messageComponent = messageComponent;
        this.loggingComponent = loggingComponent;
        this.musicComponent = musicComponent;
        this.bot = bot;
    }

    // --- Dependencies ---

    /**
     * The service for YouTube
     *
     * @type {YoutubeService}
     */
    private youtubeService: YoutubeService;

    /**
     * The logging component for the component
     *
     * @type {LoggingComponent}
     */
    private loggingComponent: LoggingComponent;

    /**
     * The data component for ELIA
     *
     * @type {DataComponent}
     */
    private dataComponent: DataComponent;

    /**
     * The message component for ELIA
     *
     * @type {MessageComponent}
     */
    private messageComponent: MessageComponent;

    /**
     * The music component for ELIA
     *
     * @type {MusicComponent}
     */
    private musicComponent: MusicComponent;
    /**
     * The Discord client of the bot
     *
     * @type {Client}
     */
    private bot: Client;

    // --- Properties ---

    /**
     * The joined voice channel, null if not joined any
     *
     * @type {?VoiceChannel}
     */
    private voiceChannel: VoiceChannel | null = null;

    /**
     * The AudioPlayer, null if not playing music
     *
     * @type {?AudioPlayer}
     */
    private audioPlayer: AudioPlayer | null = null;

    /**
     * The last song's YouTube stream, null if not playing music
     *
     * @type {?Readable}
     */
    private stream: internal.Readable | null = null;

    /**
     * The volume for the music, every play command refreshres it's value
     */
    private volume = 0.0;

    // --- Flags ---

    /**
     * Determines if music is being played is paused or not
     *
     * @type {boolean}
     */
    private isPaused = false;

    /**
     * Get the voice channel from message, if config not available, falls back to function parameter
     *
     * @param {VoiceChannel} voiceChannel the voice channel the user is in
     * @param {Message} message the message that has the music command
     * @returns {VoiceChannel} the new music voice channel
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
     * Get the volume number from guild id
     *
     * @param {?string} guildId the id of the guild
     * @returns {number} the volume number
     */
    private getMusicVolume(guildId: string | undefined): number {
        let vol: string;

        if (guildId) {
            vol = this.dataComponent.getMusicVolume(guildId);
        } else {
            vol = this.dataComponent.getMusicVolume(undefined);
        }
        return parseFloat(vol);
    }

    /**
     * Starts playing a song
     *
     * @param {?Message} message a Discord message
     * @param {VoiceChannel} channel a Discord channel
     * @param {MusicData} song the song to be played
     */
    async play(
        message: Message | undefined,
        channel: VoiceChannel,
        song: MusicData
    ): Promise<void> {
        if (this.voiceChannel === null || channel.id !== this.voiceChannel.id) {
            await this.joinChannel(channel);
        }
        if (this.voiceChannel != null && this.audioPlayer != null) {
            this.playSong(song);
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

    /**
     * Plays a song
     *
     * @param {MusicData} song the song to be played
     */
    async playSong(song: MusicData): Promise<void> {
        if (this.voiceChannel != null && this.audioPlayer != null) {
            const { stream, type } = await demuxProbe(
                this.youtubeService.getStreamFromUrl(song.url)
            );
            this.stream = stream;
            const audio = createAudioResource(stream, { inputType: type });
            audio.volume?.setVolume(this.volume);
            this.audioPlayer.play(audio);
        }
    }

    /**
     * Stops playing music
     *
     * @returns {boolean} true if stopped playing music, false if nothing happened
     */
    stop(): boolean {
        if (this.voiceChannel) {
            const connection = getVoiceConnection(this.voiceChannel.guild.id);
            connection?.destroy();
            this.stream?.destroy();
            this.stream = null;
            this.voiceChannel = null;
            this.isPaused = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Joins a voice channel
     *
     * @param {VoiceChannel} channel the voice channel to join
     */
    private async joinChannel(channel: VoiceChannel) {
        this.voiceChannel = channel;
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild
                .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
        this.volume = this.getMusicVolume(channel.guild.id);
        this.audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.stream?.destroy();
            this.stream = null;
            this.musicComponent.continuePlayingMusic();
        });

        connection.subscribe(this.audioPlayer);
    }

    /**
     * Pauses the music
     *
     * @param {Message} message the Discord message which requested the pause
     */
    pauseMusic(message: Message): void {
        if (
            !this.isPaused &&
            this.voiceChannel != null &&
            this.audioPlayer != null
        ) {
            this.isPaused = true;
            this.messageComponent.reply(message, "You paused the music.");
            this.loggingComponent.log(
                message.author.username + " paused the music"
            );
            this.audioPlayer.pause();
        } else {
            this.messageComponent.reply(
                message,
                "You can't pause the music right now."
            );
        }
    }

    /**
     * Resumes playing music
     *
     * @param {Message} message the Discord message which requested the resume
     */
    resumeMusic(message: Message): void {
        if (
            this.isPaused &&
            this.voiceChannel != null &&
            this.audioPlayer != null
        ) {
            this.isPaused = false;
            this.messageComponent.reply(
                message,
                "You resumed playing the music."
            );
            this.loggingComponent.log(
                message.author.username + " resumed playing the music"
            );

            this.audioPlayer.unpause();
        } else {
            this.messageComponent.reply(
                message,
                "You can't resume the music right now."
            );
        }
    }
}
