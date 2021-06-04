import MusicQueue from "./MusicQueue";
import { Message, VoiceChannel } from "discord.js";
import MusicData from "./MusicData";
import MessageComponent from "../core/MessageComponent";
import MusicPlayer from "./MusicPlayer";
import YoutubeService from "./YoutubeService";
//song command imports
import Command from "../../commands/Command";
import CurrentSongCommand from "../../commands/voice/music/CurrentSongCommand";
import GetQueueCommand from "../../commands/voice/music/GetQueueCommand";
import LeaveCommand from "../../commands/voice/music/LeaveCommand";
import LoopQueueCommand from "../../commands/voice/music/LoopQueueCommand";
import LoopSongCommand from "../../commands/voice/music/LoopSongCommand";
import PauseCommand from "../../commands/voice/music/PauseCommand";
import PlayCommand from "../../commands/voice/music/PlayCommand";
import QueueSongCommand from "../../commands/voice/music/QueueSongCommand";
import RemoveSongFromQueueCommand from "../../commands/voice/music/RemoveSongFromQueueCommand";
import ReplaySongCommand from "../../commands/voice/music/ReplaySongCommand";
import ResumeSongCommand from "../../commands/voice/music/ResumeSongCommand";
import ShuffleQueueCommand from "../../commands/voice/music/ShuffleQueueCommand";
import SkipSongCommand from "../../commands/voice/music/SkipSongCommand";

/**
 * Component for ELIA which add the music commands
 */
export default class MusicComponent {
    static getMusicCommands(youtubeService: YoutubeService): Command[] {
        return [
            new CurrentSongCommand(),
            new GetQueueCommand(),
            new LeaveCommand(),
            new LoopQueueCommand(),
            new LoopSongCommand(),
            new PauseCommand(),
            new PlayCommand(youtubeService),
            new QueueSongCommand(),
            new RemoveSongFromQueueCommand(),
            new ReplaySongCommand(),
            new ResumeSongCommand(),
            new ShuffleQueueCommand(),
            new SkipSongCommand(),
        ];
    }
    constructor(
        messageComponent: MessageComponent,
        musicQueue: MusicQueue,
        musicPlayer: MusicPlayer
    ) {
        this.messageComponent = messageComponent;
        this.musicQueue = musicQueue;
        this.musicPlayer = musicPlayer;
    }

    /**
     * The message component for ELIA
     *
     * @type {MessageComponent}
     */
    private messageComponent: MessageComponent;

    /**
     * The music queue for the component
     *
     * @type {MusicQueue}
     */
    private musicQueue: MusicQueue;

    /**
     * The music player for the component
     *
     * @type {MusicPlayer}
     */
    private musicPlayer: MusicPlayer;

    /**
     * Check's if the user who sent the massage has permissions to connect and speak in the channel he/she currently in.
     *
     * @param {Message} message the message which the user sent with valid music command
     * @returns {boolean} true if the user has the right permissions, else false
     */
    messageSenderHasRightPermissions(message: Message): boolean {
        if (
            message.member &&
            message.member.voice &&
            message.member.voice.channel &&
            message.client.user
        ) {
            const permissions = message.member.voice.channel.permissionsFor(
                message.client.user
            );
            if (
                permissions &&
                (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
            ) {
                this.messageComponent.reply(
                    message,
                    "You don't have the correct permissions"
                );
                return false;
            } else return true;
        } else return false;
    }

    /**
     * Check's if the sender of the message is in a voice channel.
     *
     * @param {Message} message the message which the user sent with valid music command
     * @returns {boolean} true if the user is a voice channel
     */
    messageSenderInVoiceChannel(message: Message): boolean {
        if (
            message.member &&
            message.member.voice &&
            message.member.voice.channel
        ) {
            return true;
        } else {
            if (this.messageComponent) {
                this.messageComponent.reply(
                    message,
                    "You need to be in a channel to execute this command!"
                );
            }
            return false;
        }
    }

    /**
     * Get's the current song, and sends it to the user
     *
     * @param {Message} message the Discord message which requested to get the current song
     */
    getCurrentSong(message: Message): void {
        this.musicQueue.getCurrentSong(message);
    }

    /**
     * Get's the current music queue, and sends it to the user
     *
     * @param {Message} message the Discord message which requested to get the queue
     */
    getQueuedMusic(message: Message): void {
        this.musicQueue.getQueuedMusic(message);
    }

    /**
     * Stop's playing music
     *
     * @param {Message} message the message that requested to stop the music
     */
    stopMusic(message: Message): void {
        this.musicQueue.stopMusic(message);
    }

    /**
     * Start's or stop's looping the current queue in the queue
     *
     * @param {Message} message the Discord message which requested to loop the queue
     */
    loopMusicQueue(message: Message): void {
        this.musicQueue.loopMusicQueue(message);
    }

    /**
     * Start's or stop's looping the current song in the queue
     *
     * @param {Message} message the Discord message which requested to loop the current song
     */
    loopCurrentSong(message: Message): void {
        this.musicQueue.loopCurrentSong(message);
    }

    /**
     * Pauses the music
     *
     * @param {Message} message the Discord message which requested the pause
     */
    pauseMusic(message: Message): void {
        this.musicQueue.pauseMusic(message);
    }

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
        return this.musicPlayer.getVoiceChannel(voiceChannel, message);
    }

    /**
     * Queues a music from YouTube
     *
     * @param {Message} message the Discord message which requested to queue a song,
     * @param {string} url YouTube link to the music
     */
    queueMusic(message: Message, url: string): void {
        this.musicQueue.queueMusic(message, url);
    }

    /**
     * Removes music from the queue
     *
     * @param {string} number the index or range in the queue
     * @param {Message} message the Discord message which requested to remove the music from the queue
     */
    removeFromQueue(number: string, message: Message): void {
        this.musicQueue.removeFromQueue(number, message);
    }

    /**
     * Replays the current song
     *
     * @param {Message} message the Discord message which requested the replay
     */
    replayMusic(message: Message): void {
        this.musicQueue.replayMusic(message);
    }

    /**
     * Resumes playing music
     *
     * @param {Message} message the Discord message which requested the resume
     */
    resumeMusic(message: Message): void {
        this.musicQueue.resumeMusic(message);
    }

    /**
     * Shuffle's the queue
     *
     * @param {Message} message the Discord message which requested to shuffle the queue
     */
    shuffleMusic(message: Message): void {
        this.musicQueue.shuffleMusic(message);
    }

    /**
     * Skip's a song
     *
     * @param {Message} message the Discord message which requested to skip a song
     */
    skipSong(message: Message): void {
        this.musicQueue.skipSong(message);
    }

    /**
     * Imports and plays a YouTube playlist
     *
     * @param {Message} message the Discord message which requested to play a playlist
     * @param {VoiceChannel} voiceChannel the Discord channel where to play the music
     * @param {string} id the YouTube id of the playlist
     */
    playYouTubePlaylist(
        message: Message,
        voiceChannel: VoiceChannel,
        id: string
    ): void {
        this.musicQueue.playYouTubePlaylist(message, voiceChannel, id);
    }

    /**
     * Play's music. If currently playing music, overrides it, if not, start playing music.
     *
     * @param {Message} message the Discord message containing the URL
     * @param {VoiceChannel} voiceChannel the message sender's voice channel
     * @param {MusicData} music the msuic to be played
     */
    playMusic(
        message: Message,
        voiceChannel: VoiceChannel,
        music: MusicData
    ): void {
        this.musicQueue.playMusic(
            message,
            voiceChannel,
            music.url,
            music.title
        );
    }

    /**
     * Continues playing music if the queue is not empty
     */
    continuePlayingMusic(): void {
        if (
            this.musicQueue.hasSongs() > 0 &&
            this.musicPlayer.hasMembersInVoice()
        ) {
            this.playMusicFromQueue();
        } else {
            this.stopMusic(undefined);
        }
    }
}
