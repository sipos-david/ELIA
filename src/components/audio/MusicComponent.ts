import MusicQueue from "./MusicQueue";
import { Client, StageChannel, VoiceChannel } from "discord.js";
import MusicData from "../../model/MusicData";
import MessageComponent from "../core/MessageComponent";
import YoutubeService from "../../services/YoutubeService";
import ActivityDisplayComponent from "../core/ActivityDisplayComponent";
import LoggingComponent from "../core/LoggingComponent";
import AudioComponent from "./AudioComponent";
import GuildProperties from "../../model/GuildProperties";
// song command imports
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
import CommandCallSource from "../../model/CommandCallSource";

/**
 * Component for ELIA handles the music commands
 */
export default class MusicComponent {
    constructor(
        private readonly guildProperties: GuildProperties,
        private readonly bot: Client,
        private readonly youtubeService: YoutubeService,
        private readonly activityDisplayComponent: ActivityDisplayComponent,
        private readonly messageComponent: MessageComponent,
        private readonly loggingComponent: LoggingComponent,
        private readonly audioComponent: AudioComponent,
    ) { }

    private readonly musicQueue: MusicQueue = new MusicQueue();

    /**
     * Check's if the user who sent the massage has permissions to connect and speak in the channel he/she currently in.
     *
     * @param {CommandCallSource} source the message which the user sent with valid music command
     * @returns {boolean} true if the user has the right permissions, else false
     */
    messageSenderHasRightPermissions(source: CommandCallSource): boolean {
        const sender = source.member;
        if (sender && sender.voice && sender.voice.channel) {
            const permissions = sender.voice.channel.permissionsFor(sender);
            if (
                permissions &&
                (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
            ) {
                this.messageComponent.reply(
                    source,
                    "You don't have permissions to connect and speak in that voice channel",
                );
                return false;
            } else { return true; }
        } else { return false; }
    }

    /**
     * Check's if the sender of the message is in a voice channel.
     *
     * @param {CommandCallSource} source the message which the user sent with valid music command
     * @returns {boolean} true if the user is a voice channel
     */
    messageSenderInVoiceChannel(source: CommandCallSource): boolean {
        if (
            source.member &&
            source.member.voice &&
            source.member.voice.channel
        ) {
            return true;
        } else {
            if (this.messageComponent) {
                this.messageComponent.reply(
                    source,
                    "You need to be in a channel to execute this command!",
                );
            }
            return false;
        }
    }

    /**
     * Get's the current song, and sends it to the user
     *
     * @param {CommandCallSource} source the Discord message which requested to get the current song
     */
    getCurrentSong(source: CommandCallSource): void {
        const current = this.musicQueue.getCurrentSong();
        if (current) {
            this.messageComponent.reply(
                source,
                "Current song: ***" +
                current.title +
                "*** at ***" +
                current.url +
                "***",
            );
        }
    }

    /**
     * Get's the current music queue, and sends it to the user
     *
     * @param {CommandCallSource} source the Discord message which requested to get the queue
     */
    getQueuedMusic(source: CommandCallSource): void {
        // TODO current queue in nice format
        const current = this.musicQueue.getCurrentSong();
        const queue = this.musicQueue.getQueuedMusic();
        let reply = "";
        if (current) {
            reply += "***Current song: *** " + current?.title + "\n";
        }
        if (queue.length > 0) {
            reply += "***The queue has " + queue.length + " songs:***\n";
            for (const song of queue) {
                reply += song.title + " at " + song.url + "\n";
            }
        }
        this.messageComponent.reply(source, reply);
    }

    /**
     * Stop's playing music
     *
     * @param {?CommandCallSource} source the message that requested to stop the music
     */
    stopMusic(source: CommandCallSource | undefined = undefined): void {
        this.audioComponent.stop();
        this.musicQueue.stop();
        this.activityDisplayComponent.setDefault();
        if (source) {
            this.messageComponent.reply(
                source,
                "Bye Bye :smiling_face_with_tear:",
            );
        }
    }

    /**
     * Start's or stop's looping the current queue in the queue
     *
     * @param {CommandCallSource} source the Discord message which requested to loop the queue
     */
    loopMusicQueue(source: CommandCallSource): void {
        const isQueueLooping = this.musicQueue.toogleQueueLooping();
        if (isQueueLooping) {
            this.messageComponent.reply(
                source,
                "You started looping the queue!",
            );
            this.loggingComponent.log(
                source.user.username + " started looping the queue",
            );
        } else {
            this.messageComponent.reply(
                source,
                "You stopped looping the queue!",
            );
            this.loggingComponent.log(
                source.user.username + " stopped looping the queue",
            );
        }
    }

    /**
     * Start's or stop's looping the current song in the queue
     *
     * @param {CommandCallSource} source the Discord message which requested to loop the current song
     */
    loopCurrentSong(source: CommandCallSource): void {
        const isSongLooping = this.musicQueue.toogleSongLooping();
        if (isSongLooping) {
            this.messageComponent.reply(
                source,
                "You started looping the current song!",
            );
            this.loggingComponent.log(
                source.user.username + " started looping the current song",
            );
        } else {
            this.messageComponent.reply(
                source,
                "You stopped looping the current song!",
            );
            this.loggingComponent.log(
                source.user.username + " stopped looping the current song",
            );
        }
    }

    /**
     * Get the voice channel from message, if config not available, falls back to function parameter
     *
     * @param {VoiceChannel} voiceChannel the voice channel the user is in
     * @param {CommandCallSource} source the message that has the music command
     * @returns {?VoiceChannel} the new music voice channel
     */
    async getVoiceChannel(
        voiceChannel: VoiceChannel | StageChannel,
        source: CommandCallSource,
    ): Promise<VoiceChannel | undefined> {
        if (voiceChannel instanceof StageChannel) {
            return undefined;
        } else if (this.guildProperties.modes.isRadio && source.guild) {
            const radioChannel = this.guildProperties.channels.radioId;
            if (radioChannel) {
                return this.getRadioChannel(source, radioChannel);
            }
            return voiceChannel;
        } else {
            return voiceChannel;
        }
    }

    private getRadioChannel(
        source: CommandCallSource,
        radioChannel: string,
    ): VoiceChannel | undefined {
        const radioVoiceChannel = this.bot.channels.cache.get(radioChannel);
        if (radioVoiceChannel) {
            if (radioVoiceChannel instanceof VoiceChannel) {
                return radioVoiceChannel;
            } else {
                return undefined;
            }
        } else {
            this.messageComponent.reply(
                source,
                "Radio channel not available for current server!",
            );
            return undefined;
        }
    }

    /**
     * Queues a music from YouTube
     *
     * @param {CommandCallSource} source the Discord message containing the URL
     * @param {VoiceChannel} voiceChannel the message sender's voice channel
     * @param {MusicData} music the music to be played
     */
    queueMusic(
        source: CommandCallSource,
        voiceChannel: VoiceChannel,
        music: MusicData,
    ): void {
        if (music.title) {
            this.messageComponent.reply(
                source,
                ":musical_note: Queued: ***" +
                music.title +
                "*** at ***" +
                music.url +
                "***",
            );
        } else {
            this.messageComponent.reply(
                source,
                ":musical_note: Queued: ***" + music.url + "***",
            );
        }
        if (!this.musicQueue.isPlayingMusic) {
            this.startPlayingMusic(source, voiceChannel, music);
        } else {
            this.musicQueue.add([music]);
        }
    }

    /**
     * Removes music from the queue
     *
     * @param {CommandCallSource} source the Discord message which requested to remove the music from the queue
     * @param {string} number the index or range in the queue
     */
    removeFromQueue(source: CommandCallSource, number: string): void {
        let removedSongs: MusicData[] = [];
        if (number.indexOf("-") === -1) {
            const removed = this.musicQueue.remove(parseInt(number) - 1);
            if (removed) {
                removedSongs.push(removed);
            }
        } else {
            const indexes = number.split("-");
            if (indexes.length <= 1) return;
            if (indexes[0] && indexes[1]) {
                const indexFrom = parseInt(indexes[0]) - 1;
                const indexTo = parseInt(indexes[1]) - 1;
                if (indexFrom == indexTo) {
                    this.musicQueue.remove(indexFrom);
                } else if (indexFrom < indexTo) {
                    removedSongs = this.musicQueue.removeRange(
                        indexFrom,
                        indexTo,
                    );
                } else {
                    removedSongs = this.musicQueue.removeRange(
                        indexTo,
                        indexFrom,
                    );
                }
            }
        }
        // TODO better removed songs message formatting
        let reply = "***Removed " + removedSongs.length + " songs:***\n";
        for (const song of removedSongs) {
            reply += song.title + " at " + song.url + "\n";
        }
        this.loggingComponent.log(
            source.user.username + " removed " + removedSongs.length + " songs",
        );
        this.messageComponent.reply(source, reply);
    }

    /**
     * Replays the current song
     *
     * @param {CommandCallSource} source the Discord message which requested the replay
     */
    replayMusic(source: CommandCallSource): void {
        const lastSong = this.musicQueue.replay();
        if (lastSong) {
            this.messageComponent.reply(source, "You replayed a song!");
            this.loggingComponent.log(
                source.user.username + " replayed a song",
            );
            this.audioComponent.playSong(lastSong);
        } else {
            this.messageComponent.reply(
                source,
                "It seems there are no song to replay.",
            );
        }
    }

    /**
     * Resumes playing music
     *
     * @param {CommandCallSource} source the Discord message which requested the resume
     */
    resumeMusic(source: CommandCallSource): void {
        if (this.musicQueue.isPlayingMusic) {
            this.musicQueue.isPaused = false;
            if (!this.musicQueue.isPaused) {
                this.messageComponent.reply(
                    source,
                    "You resumed playing the music.",
                );
                this.loggingComponent.log(
                    source.user.username + " resumed playing the music",
                );
                this.audioComponent.resumeMusic();
            } else {
                this.messageComponent.reply(
                    source,
                    "You can't resume the music right now.",
                );
            }
        } else {
            this.messageComponent.reply(
                source,
                "Not playing a song currently!",
            );
        }
    }

    /**
     * Pauses the music
     *
     * @param {CommandCallSource} source the Discord message which requested the pause
     */
    pauseMusic(source: CommandCallSource): void {
        if (this.musicQueue.isPlayingMusic) {
            this.musicQueue.isPaused = true;
            if (this.musicQueue.isPaused) {
                this.messageComponent.reply(source, "You paused the music.");
                this.loggingComponent.log(
                    source.user.username + " paused the music",
                );
                this.audioComponent.pauseMusic();
            } else {
                this.messageComponent.reply(
                    source,
                    "You can't pause the music right now.",
                );
            }
        } else {
            this.messageComponent.reply(
                source,
                "Not playing a song currently!",
            );
        }
    }

    /**
     * Shuffle's the queue
     *
     * @param {CommandCallSource} source the Discord message which requested to shuffle the queue
     */
    shuffleMusic(source: CommandCallSource): void {
        if (this.musicQueue.isPlayingMusic) {
            if (this.musicQueue.shuffle()) {
                this.messageComponent.reply(source, "You shuffled the music.");
                this.loggingComponent.log(
                    source.user.username + " shuffled the music",
                );
            }
        } else {
            this.messageComponent.reply(
                source,
                "Not playing a song currently!",
            );
        }
    }

    /**
     * Skip's a song
     *
     * @param {CommandCallSource} source the Discord message which requested to skip a song
     */
    skipSong(source: CommandCallSource): void {
        if (this.musicQueue.isPlayingMusic) {
            this.messageComponent.reply(source, "You skipped a song!");
            this.loggingComponent.log(source.user.username + " skipped a song");
            this.audioComponent.skip();
        } else {
            this.messageComponent.reply(
                source,
                "Not playing a song currently!",
            );
        }
    }

    /**
     * Imports and plays a YouTube playlist
     *
     * @param {CommandCallSource} source the Discord message which requested to play a playlist
     * @param {VoiceChannel} voiceChannel the Discord channel where to play the music
     * @param {string} id the YouTube id of the playlist
     */
    async playYouTubePlaylist(
        source: CommandCallSource,
        voiceChannel: VoiceChannel,
        id: string,
    ): Promise<void> {
        const songs = await this.youtubeService.getPlaylistFromId(id);
        this.musicQueue.add(songs);
        const current = this.musicQueue.getNext();
        if (current) {
            this.messageComponent.reply(
                source,
                "You started playing a YouTube Playlist!",
            );

            this.loggingComponent.log(
                source.user.username + " imported a YouTube playlist",
            );
            this.startPlayingMusic(source, voiceChannel, current);
        }
    }

    /**
     * Play's music. If currently playing music, overrides it, if not, starts playing music.
     *
     * @param {CommandCallSource} source the Discord message containing the URL
     * @param {VoiceChannel} voiceChannel the message sender's voice channel
     * @param {MusicData} music the music to be played
     */
    startPlayingMusic(
        source: CommandCallSource,
        voiceChannel: VoiceChannel,
        music: MusicData,
    ): void {
        this.musicQueue.play(music);
        this.play(source, voiceChannel, music);
        this.activityDisplayComponent.setMusicPlaying();
    }

    /**
     * Continues playing music if the queue is not empty
     */
    continuePlayingMusic(): void {
        if (this.audioComponent.hasMembersInVoice()) {
            const currentSong = this.musicQueue.getNext();
            if (currentSong) {
                this.audioComponent.playSong(currentSong);
            } else {
                this.stopMusic();
            }
        } else {
            this.stopMusic();
        }
    }

    /**
     * Starts playing a song
     *
     * @param {?CommandCallSource} source a Discord message
     * @param {VoiceChannel} channel a Discord channel
     * @param {MusicData} song the song to be played
     */
    async play(
        source: CommandCallSource | undefined,
        channel: VoiceChannel,
        song: MusicData,
    ): Promise<void> {
        this.audioComponent.playSong(song, channel, () => {
            this.continuePlayingMusic();
        });
        if (source) {
            if (song.title) {
                this.messageComponent.reply(
                    source,
                    ":musical_note: Now Playing ***" +
                    song.title +
                    "*** at ***" +
                    song.url +
                    "***",
                );
            } else {
                this.messageComponent.reply(
                    source,
                    ":musical_note: Now Playing ***" + song.url + "***",
                );
            }
            this.loggingComponent.log(
                source.user.username + " played: " + song.url,
            );
        }
    }
}

/**
 * Gets the music commands in an array
 *
 * @param {PlayCommand} playCommand the play command in the commands, needed for DI, since the play command has DI
 * @param {QueueSongCommand} queueSongCommand  the queue command in the commands, needed for DI, since the play command has DI
 * @returns {Command[]} the array of the command objects
 */
export function getMusicCommands(
    playCommand: PlayCommand,
    queueSongCommand: QueueSongCommand,
): Command[] {
    return [
        new CurrentSongCommand(),
        new GetQueueCommand(),
        new LeaveCommand(),
        new LoopQueueCommand(),
        new LoopSongCommand(),
        new PauseCommand(),
        playCommand,
        queueSongCommand,
        new RemoveSongFromQueueCommand(),
        new ReplaySongCommand(),
        new ResumeSongCommand(),
        new ShuffleQueueCommand(),
        new SkipSongCommand(),
    ];
}
