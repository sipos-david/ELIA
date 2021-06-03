import MusicQueue from "./MusicQueue";
import Elia from "../../Elia";
import { Message, VoiceChannel } from "discord.js";
//song command imports
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
import LateInitComponent from "../LateInitComponent";

/**
 * Component for ELIA which add the music commands
 */
export default class MusicComponent extends LateInitComponent {
    /**
     * Set's up the MusicComponent object for the usage of music commands.
     *
     * @param {Elia} elia an Elia object
     */
    init(elia: Elia): void {
        this.elia = elia;
        this.elia.musicComponent = this;
        /**
         * The music queue for the component
         *
         * @type {MusicQueue}
         */
        this.musicQueue = new MusicQueue(elia);

        const commands = [
            new CurrentSongCommand(),
            new GetQueueCommand(),
            new LeaveCommand(),
            new LoopQueueCommand(),
            new LoopSongCommand(),
            new PauseCommand(),
            new PlayCommand(),
            new QueueSongCommand(),
            new RemoveSongFromQueueCommand(),
            new ReplaySongCommand(),
            new ResumeSongCommand(),
            new ShuffleQueueCommand(),
            new SkipSongCommand(),
        ];

        commands.forEach((cmd) => elia.commandMap.set(cmd.name, cmd));

        elia.loggingComponent.log("Music commands added to Elia.");
    }

    elia: Elia | undefined;

    /**
     * The music queue for the component
     *
     * @type {MusicQueue}
     */
    musicQueue: MusicQueue | undefined;

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
            message.client.user &&
            this.elia
        ) {
            const permissions = message.member.voice.channel.permissionsFor(
                message.client.user
            );
            if (
                permissions &&
                (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
            ) {
                this.elia.messageComponent.reply(
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
            if (this.elia) {
                this.elia.messageComponent.reply(
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
        this.musicQueue?.getCurrentSong(message);
    }

    /**
     * Get's the current music queue, and sends it to the user
     *
     * @param {Message} message the Discord message which requested to get the queue
     */
    getQueuedMusic(message: Message): void {
        this.musicQueue?.getQueuedMusic(message);
    }

    /**
     * Stop's playing music
     *
     * @param {Message} message the message that requested to stop the music
     */
    stopMusic(message: Message): void {
        this.musicQueue?.stopMusic(message);
    }

    /**
     * Start's or stop's looping the current queue in the queue
     *
     * @param {Message} message the Discord message which requested to loop the queue
     */
    loopMusicQueue(message: Message): void {
        this.musicQueue?.loopMusicQueue(message);
    }

    /**
     * Start's or stop's looping the current song in the queue
     *
     * @param {Message} message the Discord message which requested to loop the current song
     */
    loopCurrentSong(message: Message): void {
        this.musicQueue?.loopCurrentSong(message);
    }

    /**
     * Pauses the music
     *
     * @param {Message} message the Discord message which requested the pause
     */
    pauseMusic(message: Message): void {
        this.musicQueue?.pauseMusic(message);
    }

    /**
     * Get the voice channel from message
     *
     * @param {VoiceChannel} channel the voice channel the user is in
     * @param {Message} message the message that has the music command
     * @returns {?VoiceChannel} the new music voice channel
     */
    getVoiceChannel(
        channel: VoiceChannel,
        message: Message
    ): Promise<VoiceChannel> | undefined {
        return this.musicQueue?.getVoiceChannel(channel, message);
    }

    /**
     * Queues a music from YouTube
     *
     * @param {Message} message the Discord message which requested to queue a song,
     * @param {string} url YouTube link to the music
     */
    queueMusic(message: Message, url: string): void {
        this.musicQueue?.queueMusic(message, url);
    }

    /**
     * Removes music from the queue
     *
     * @param {string} number the index or range in the queue
     * @param {Message} message the Discord message which requested to remove the music from the queue
     */
    removeFromQueue(number: string, message: Message): void {
        this.musicQueue?.removeFromQueue(number, message);
    }

    /**
     * Replays the current song
     *
     * @param {Message} message the Discord message which requested the replay
     */
    replayMusic(message: Message): void {
        this.musicQueue?.replayMusic(message);
    }

    /**
     * Resumes playing music
     *
     * @param {Message} message the Discord message which requested the resume
     */
    resumeMusic(message: Message): void {
        this.musicQueue?.resumeMusic(message);
    }

    /**
     * Shuffle's the queue
     *
     * @param {Message} message the Discord message which requested to shuffle the queue
     */
    shuffleMusic(message: Message): void {
        this.musicQueue?.shuffleMusic(message);
    }

    /**
     * Skip's a song
     *
     * @param {Message} message the Discord message which requested to skip a song
     */
    skipSong(message: Message): void {
        this.musicQueue?.skipSong(message);
    }
}
