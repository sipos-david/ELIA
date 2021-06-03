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

    getCurrentSong(message: Message): void {
        this.musicQueue?.getCurrentSong(message);
    }

    getQueuedMusic(message: Message): void {
        this.musicQueue?.getQueuedMusic(message);
    }

    stopMusic(message: Message): void {
        this.musicQueue?.stopMusic(message);
    }

    loopMusicQueue(message: Message): void {
        this.musicQueue?.loopMusicQueue(message);
    }

    loopCurrentSong(message: Message): void {
        this.musicQueue?.loopCurrentSong(message);
    }

    pauseMusic(message: Message): void {
        this.musicQueue?.pauseMusic(message);
    }

    getVoiceChannel(channel: VoiceChannel, message: Message): void {
        this.musicQueue?.getVoiceChannel(channel, message);
    }

    queueMusic(message: Message, url: string): void {
        this.musicQueue?.queueMusic(message, url);
    }

    removeFromQueue(number: string, message: Message): void {
        this.musicQueue?.removeFromQueue(number, message);
    }

    replayMusic(message: Message): void {
        this.musicQueue?.replayMusic(message);
    }

    resumeMusic(message: Message): void {
        this.musicQueue?.resumeMusic(message);
    }

    shuffleMusic(message: Message): void {
        this.musicQueue?.shuffleMusic(message);
    }

    skipSong(message: Message): void {
        this.musicQueue?.skipSong(message);
    }
}
