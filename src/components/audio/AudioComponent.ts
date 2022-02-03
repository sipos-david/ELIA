import {
    createAudioResource,
    AudioResource,
} from "@discordjs/voice";
import { Client, VoiceChannel } from "discord.js";
import LoggingComponent from "../core/LoggingComponent";
import MusicData from "../../model/MusicData";
import YoutubeService from "../../services/YoutubeService";
import GuildProperties from "../../model/GuildProperties";
import AudioInstance from "./AudioInstance";

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
    ) { }

    /**
     * The joined voice channel, null if not joined any
     *
     * @type {?VoiceChannel}
     */
    private voiceChannel: VoiceChannel | null = null;

    private audioInstance: AudioInstance | null = null;


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
        if (channel && this.voiceChannel?.id !== channel?.id) {
            this.audioInstance = new AudioInstance(this.loggingComponent, channel, onFinish);
        }

        const stream = await this.youtubeService.getStreamFromUrl(song.url);
        const audio = createAudioResource(stream.stream, {
            inputType: stream.type,
        });
        audio.volume?.setVolume(this.guildProperties.musicVolume);

        this.audioInstance?.play(audio);
    }


    /**
     * Plays a sound effect
     *
     * @param {? AudioResource<null>} resource the sound effect to be played
     * @param {VoiceChannel} channel the channel to play
     */
    async playSoundEffect(
        resource: AudioResource<null>,
        channel: VoiceChannel
    ): Promise<void> {
        if (!this.voiceChannel) {
            this.voiceChannel = channel;
            this.audioInstance = new AudioInstance(this.loggingComponent, channel, () => {
                this.stop();
            });
        }
        resource.volume?.setVolume(this.guildProperties.musicVolume);
        this.audioInstance?.play(resource);
    }

    /**
     * Stops playing music
     */
    stop() {
        this.audioInstance?.stop();
        this.audioInstance = null;
        this.voiceChannel = null;
    }

    /**
     * Skips playing a song
     */
    skip() {
        this.audioInstance?.skip();
    }

    /**
     * Pauses the music
     *
     */
    pauseMusic(): void {
        this.audioInstance?.pause();
    }

    /**
     * Resumes playing music
     *
     */
    resumeMusic(): void {
        this.audioInstance?.resume();
    }
}