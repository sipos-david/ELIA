import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    DiscordGatewayAdapterCreator,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    AudioResource,
    entersState,
    VoiceConnectionStatus,
    AudioPlayerState,
    VoiceConnectionState,
    joinVoiceChannel,
    VoiceConnectionDisconnectedState,
} from "@discordjs/voice";
import { Client, VoiceChannel } from "discord.js";
import LoggingComponent from "../components/core/LoggingComponent";
import MusicData from "../model/MusicData";
import YoutubeService from "../services/YoutubeService";
import GuildProperties from "../model/GuildProperties";

/**
 * Class for handling
 */
export default class AudioComponent {
    constructor(
        /**
         * The properties for the guild
         *
         * @type {GuildProperties}
         */
        private readonly guildProperties: GuildProperties,

        /**
         * The service for YouTube
         *
         * @type {YoutubeService}
         */
        private readonly youtubeService: YoutubeService,

        /**
         * The logging component for the component
         *
         * @type {LoggingComponent}
         */
        private readonly loggingComponent: LoggingComponent,

        /**
         * The Discord client of the bot
         *
         * @type {Client}
         */
        private readonly bot: Client
    ) {}
    /**
     * The  voice connection, null if not playing music
     *
     * @type {?VoiceConnection}
     */
    private voiceConnection: VoiceConnection | null = null;

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

    // --- Flags ---
    private readyLock = false;

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
            !this.guildProperties.modes.isRadio
        ) {
            this.loggingComponent.log("Elia was left alone...");
            return false;
        } else return true;
    }

    /**
     * Plays a song
     *
     * @param {?MusicData} song the song to be played
     * @param {VoiceChannel} channel the channel to play
     * @param {void} onFinish the callback to call after the song is played
     */
    async playSong(
        song: MusicData,
        channel: VoiceChannel | undefined = undefined,
        onFinish: () => void = () => {
            /* empty */
        }
    ): Promise<void> {
        if (this.voiceConnection === null && channel != undefined) {
            await this.joinChannel(channel, onFinish);
        }
        if (this.voiceConnection != null && this.audioPlayer != null) {
            if (channel && this.voiceChannel?.id !== channel?.id) {
                this.switchChannel(channel);
            }
            const stream = await this.youtubeService.getStreamFromUrl(song.url);
            const audio = createAudioResource(stream.stream, {
                inputType: stream.type,
            });
            audio.volume?.setVolume(this.guildProperties.musicVolume);
            this.audioPlayer.play(audio);
        }
    }

    switchChannel(channel: VoiceChannel) {
        this.voiceConnection?.disconnect();
        this.audioPlayer?.pause();

        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild
                .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        if (this.voiceConnection) {
            this.voiceChannel = channel;

            this.setupVoiceConnection();

            if (this.audioPlayer) {
                this.voiceConnection.subscribe(this.audioPlayer);
                this.audioPlayer.unpause();
            }
        }
    }

    private setupVoiceConnection(): void {
        this.voiceConnection?.on(
            "stateChange",
            async (_: VoiceConnectionState, newState: VoiceConnectionState) => {
                if (newState.status === VoiceConnectionStatus.Disconnected) {
                    await this.handleDisconnect(newState);
                } else if (
                    newState.status === VoiceConnectionStatus.Destroyed
                ) {
                    /**
                     * Once destroyed, stop the subscription.
                     */
                    this.stop();
                } else if (
                    !this.readyLock &&
                    (newState.status === VoiceConnectionStatus.Connecting ||
                        newState.status === VoiceConnectionStatus.Signalling)
                ) {
                    await this.handleConnectingOrSignalling();
                }
            }
        );
    }

    /**
     * Plays a sound effect
     *
     * @param {? AudioResource<null>} resource the sound effect to be played
     * @param {VoiceChannel} channel the channel to play
     * @param {void} onFinish the callback to call after the song is played
     */
    async playSoundEffect(
        resource: AudioResource<null>,
        channel: VoiceChannel | undefined = undefined,
        onFinish: () => void = () => {
            /* empty */
        }
    ): Promise<void> {
        if (this.voiceConnection === null && channel != undefined) {
            await this.joinChannel(channel, onFinish);
        }
        if (this.voiceConnection != null && this.audioPlayer != null) {
            resource.volume?.setVolume(this.guildProperties.musicVolume);
            this.audioPlayer.play(resource);
        }
    }

    /**
     * Stops playing music
     */
    stop() {
        if (this.voiceConnection) {
            this.audioPlayer?.stop(true);
            this.voiceConnection.disconnect();
        }
    }

    /**
     * Skips playing a song
     */
    skip() {
        this.audioPlayer?.stop();
    }

    /**
     * Joins a voice channel
     *
     * @param {VoiceChannel} channel the voice channel to join
     * @param {void} onFinish the callback when finished playing
     */
    private async joinChannel(channel: VoiceChannel, onFinish: () => void) {
        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild
                .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        if (this.voiceConnection) {
            this.voiceChannel = channel;
            this.audioPlayer = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });

            this.setupVoiceConnection();

            this.configureAudioPlayer(onFinish);

            this.voiceConnection.subscribe(this.audioPlayer);
        }
    }

    /**
     * In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
     * before destroying the voice connection. This stops the voice connection permanently existing in one of these
     * states.
     */
    private async handleConnectingOrSignalling() {
        this.readyLock = true;
        try {
            if (this.voiceConnection) {
                await entersState(
                    this.voiceConnection,
                    VoiceConnectionStatus.Ready,
                    20000
                );
            }
        } catch {
            if (
                this.voiceConnection?.state.status !==
                VoiceConnectionStatus.Destroyed
            )
                this.voiceConnection?.destroy();
        } finally {
            this.readyLock = false;
        }
    }

    /**
     * Handle the disconnected state
     *
     * @param {VoiceConnectionDisconnectedState} state the reason of the disconnect
     */
    private async handleDisconnect(state: VoiceConnectionDisconnectedState) {
        if (
            state.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
            state.closeCode === 4014
        ) {
            /**
             * If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
             * but there is a chance the connection will recover itself if the reason of the disconnect was due to
             * switching voice channels. This is also the same code for the bot being kicked from the voice channel,
             * so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
             * the voice connection.
             */
            try {
                if (this.voiceConnection) {
                    await entersState(
                        this.voiceConnection,
                        VoiceConnectionStatus.Connecting,
                        5000
                    );
                }
                // Probably moved voice channel
            } catch {
                this.voiceConnection?.destroy();
                // Probably removed from voice channel
            }
        } else if (getRejoinAttempts(this.voiceConnection) < 5) {
            /**
             * The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
             */
            setTimeout(
                () => this.voiceConnection?.rejoin(),
                (getRejoinAttempts(this.voiceConnection) + 1) * 5000
            );
        } else {
            /**
             * The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
             */
            this.voiceConnection?.destroy();
        }
    }

    /**
     * Configure audio player when created.
     *
     * @param {void} onFinish the callback to call after the song is played
     */
    private configureAudioPlayer(onFinish: () => void): void {
        if (this.audioPlayer) {
            // Configure audio player
            this.audioPlayer.on(
                "stateChange",
                (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                    if (
                        newState.status === AudioPlayerStatus.Idle &&
                        oldState.status !== AudioPlayerStatus.Idle
                    ) {
                        // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
                        // The queue is then processed to start playing the next track, if one is available.
                        oldState.resource as AudioResource<MusicData>;
                        onFinish();
                    } else if (newState.status === AudioPlayerStatus.Playing) {
                        // If the Playing state has been entered, then a new track has started playback.
                        newState.resource as AudioResource<MusicData>;
                    }
                }
            );

            this.audioPlayer.on("error", (error: { resource: unknown }) => {
                this.loggingComponent.error(error);
                onFinish();
            });
        }
    }
    /**
     * Pauses the music
     *
     */
    pauseMusic(): void {
        if (this.voiceConnection != null && this.audioPlayer != null) {
            this.audioPlayer.pause();
        }
    }

    /**
     * Resumes playing music
     *
     */
    resumeMusic(): void {
        if (this.voiceConnection != null && this.audioPlayer != null) {
            this.audioPlayer.unpause();
        }
    }
}

/**
 * Get the rejoin attempts from a connection
 *
 * @param {VoiceConnection} voiceConnection the voice connection
 * @returns {number} the rejoin attempts
 */
function getRejoinAttempts(voiceConnection: VoiceConnection | null): number {
    if (voiceConnection?.rejoinAttempts !== undefined) {
        return voiceConnection.rejoinAttempts;
    } else return 0;
}
