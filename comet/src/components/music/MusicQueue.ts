import Elia from "../../Elia.js";
import { VoiceConnection, VoiceChannel, Message } from "discord.js";
import playFromURL from "./UrlPlay.js";
import ytpl from "ytpl";
import ytdl from "ytdl-core";

/**
 * A music queue that play's music.
 */
export default class MusicQueue {
    /**
     * @param {Elia} elia the Elia object the music queue uses
     */
    constructor(elia: Elia) {
        this.elia = elia;
    }

    /**
     * The ELIA object
     *
     * @type {Elia}
     */
    elia: Elia;

    // --- Music ---

    /**
     * Array of YouTube links
     *
     * @type {Array<string>}
     */
    musicQueueArray: string[] = [];
    /**
     * The cache for YouTube titles
     *
     * Key is YouTube ID,
     * Value is the title
     *
     * @type {Map<string,string>}
     */
    titleMap: Map<string, string> = new Map();
    /**
     * YouTube link to the last song
     *
     * @type {?string}
     */
    lastSong: string | undefined = undefined;
    /**
     * YouTube link to the current song
     *
     * @type {?string}
     */
    currentSong: string | undefined = undefined;
    /**
     * The current song's name
     *
     * @type {?string}
     */
    currentSongName: string | null = null;

    // --- Discord data ---

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

    // --- Flags ---

    /**
     * Determines if music is being played is paused or not
     *
     * @type {boolean}
     */
    isPaused = false;
    /**
     * Determines if music is being played
     *
     * @type {boolean}
     */
    isPlayingMusic = false;
    /**
     * Determines if the current song is being looped or not
     *
     * @type {boolean}
     */
    isLoopingSong = false;
    /**
     * Determines if the current queue is being looped or not
     *
     * @type {boolean}
     */
    isLoopingQueue = false;

    // --- Music control functions ---

    /**
     * Play's music. If currently playing music, overrides it, if not, start playing music.
     *
     * @param {Message} message the Discord message containing the URL
     * @param {VoiceChannel} voiceChannel the message sender's voice channel
     * @param {string} url the YouTube link to the music
     * @param {string} title the YouTube video's title
     */
    async playMusic(
        message: Message,
        voiceChannel: VoiceChannel,
        url: string,
        title: string | undefined = undefined
    ): Promise<void> {
        if (voiceChannel == null) return;

        if (this.currentSong != null) {
            this.musicQueueArray.unshift(this.currentSong);
        }

        this.musicQueueArray.unshift(url);
        this.cacheYouTubeTitle(url);
        this.isPlayingMusic = true;

        if (
            this.voiceChannel == null ||
            voiceChannel.id != this.voiceChannel.id
        ) {
            this.voiceChannel = voiceChannel;
            this.connection = await this.voiceChannel.join();
        }
        this.playMusicFromQueue(message, title);
    }

    /**
     * Get the voice channel from message
     *
     * @param {VoiceChannel} voiceChannel the voice channel the user is in
     * @param {Message} message the message that has the music command
     * @returns {?VoiceChannel} the new music voice channel
     */
    async getVoiceChannel(
        voiceChannel: VoiceChannel,
        message: Message
    ): Promise<VoiceChannel> {
        if (this.elia.dataComponent.getRadioMode() && message.guild) {
            const radioChannel = this.elia.dataComponent.getRadioChannel(
                message.guild.id
            );
            if (radioChannel) {
                const radioVoiceChannel =
                    this.elia.bot.channels.cache.get(radioChannel);
                if (radioVoiceChannel) {
                    if (radioVoiceChannel instanceof VoiceChannel) {
                        return radioVoiceChannel;
                    }
                } else {
                    this.elia.messageComponent.reply(
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
     * Replay's the current song
     *
     * @param {Message} message the Discord message which requested the replay
     */
    replayMusic(message: Message): void {
        if (
            this.lastSong != null &&
            this.elia.musicComponent &&
            this.elia.musicComponent.musicQueue &&
            message.member &&
            message.member.voice &&
            message.member.voice.channel
        ) {
            this.elia.musicComponent.musicQueue.playMusic(
                message,
                message.member.voice.channel,
                this.lastSong
            );
            this.elia.messageComponent.reply(message, "You replayed a song!");
            this.elia.loggingComponent.log(
                message.author.username + " replayed a song"
            );
        } else {
            this.elia.messageComponent.reply(
                message,
                "It seems there are no song to replay."
            );
        }
    }

    /**
     * Stop's playing music
     *
     * @param {Message} message the message that requested to stop the music
     */
    stopMusic(message: Message | undefined): void {
        this.musicQueueArray = [];
        this.titleMap = new Map();
        this.isPlayingMusic = false;
        this.isPaused = false;
        if (this.voiceChannel != null) {
            this.voiceChannel.leave();
            if (message != null)
                this.elia.messageComponent.reply(
                    message,
                    "Bye Bye :smiling_face_with_tear:"
                );
        }
        this.voiceChannel = null;
        this.connection = null;
        this.currentSong = undefined;
        this.isLoopingSong = false;
        this.isLoopingQueue = false;
        this.elia.activityDisplayComponent.setDefault();
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
            this.connection != null
        ) {
            this.isPaused = true;
            if (this.connection.dispatcher != null) {
                this.connection.dispatcher.pause();
                this.elia.messageComponent.reply(
                    message,
                    "You paused the music."
                );
                this.elia.loggingComponent.log(
                    message.author.username + " paused the music"
                );
            }
        } else {
            this.elia.messageComponent.reply(
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
            this.connection != null
        ) {
            this.isPaused = false;
            if (this.connection.dispatcher != null) {
                this.elia.messageComponent.reply(
                    message,
                    "You resumed playing the music."
                );
                this.elia.loggingComponent.log(
                    message.author.username + " resumed playing the music"
                );
            }
            this.connection.dispatcher.resume();
        } else {
            this.elia.messageComponent.reply(
                message,
                "You can't resume the music right now."
            );
        }
    }

    /**
     * Play's music from the queue
     *
     * @param {?Message} message the Discord message which requested to queue a song, default value is null
     * @param {?string} title the title of music, default value is null
     */
    playMusicFromQueue(
        message: Message | undefined = undefined,
        title: string | undefined = undefined
    ): void {
        if (this.musicQueueArray.length > 0 && this.connection) {
            this.lastSong = this.currentSong;
            this.currentSong = this.musicQueueArray.shift();
            if (this.currentSong) {
                if (this.lastSong == null) this.lastSong = this.currentSong;
                if (this.isLoopingSong)
                    this.musicQueueArray.unshift(this.currentSong);
                if (this.isLoopingQueue && !this.isLoopingSong)
                    this.musicQueueArray.push(this.currentSong);
                this.elia.activityDisplayComponent.setMusicPlaying();
                playFromURL(
                    this.elia,
                    message,
                    this.connection,
                    this.currentSong,
                    title
                );
            }
        }
    }

    /**
     * Queues a music from YouTube
     *
     * @param {Message} message the Discord message which requested to queue a song,
     * @param {string} url YouTube link to the music
     */
    async queueMusic(message: Message, url: string): Promise<void> {
        this.elia.messageComponent.reply(
            message,
            ":musical_note: Queued: ***" + url + "***"
        );
        this.elia.loggingComponent.log(
            message.author.username + " queued: " + url
        );
        if (this.musicQueueArray.push(url) == 1 && !this.isPlayingMusic) {
            if (message.member && message.member.voice.channel) {
                const voiceChannel = await this.getVoiceChannel(
                    message.member.voice.channel,
                    message
                );
                this.playMusic(message, voiceChannel, url);
            }
        }
    }

    /**
     * Continues playing music if the queue is not empty
     */
    continuePlayingMusic(): void {
        if (this.musicQueueArray.length > 0 && this.hasMembersInVoice()) {
            this.playMusicFromQueue();
        } else {
            this.stopMusic(undefined);
        }
    }

    // --- Queue manipulation functions ---

    /**
     * Skip's a song
     *
     * @param {Message} message the Discord message which requested to skip a song
     */
    skipSong(message: Message): void {
        this.elia.messageComponent.reply(message, "You skipped a song!");
        this.elia.loggingComponent.log(
            message.author.username + " skipped a song"
        );
        this.continuePlayingMusic();
    }

    /**
     * Shuffle's the queue
     *
     * @param {Message} message the Discord message which requested to shuffle the queue
     */
    shuffleMusic(message: Message): void {
        if (this.musicQueueArray.length >= 2) {
            for (let i = this.musicQueueArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp1 = this.musicQueueArray[i];
                const temp2 = this.musicQueueArray[j];
                if (temp1 && temp2) {
                    this.musicQueueArray[i] = temp2;
                    this.musicQueueArray[j] = temp1;
                }
            }
            this.elia.messageComponent.reply(
                message,
                "You shuffled the music."
            );
            this.elia.loggingComponent.log(
                message.author.username + " shuffled the music"
            );
        }
    }

    /**
     * Removes music from the queue
     *
     * @param {string} number the index or range in the queue
     * @param {Message} message the Discord message which requested to remove the music from the queue
     */
    removeFromQueue(number: string, message: Message): void {
        if (number.indexOf("-") === -1) {
            this.removeSongFromQueue(parseInt(number) - 1, message);
        } else {
            const indexes = number.split("-");
            if (indexes.length <= 1) return;
            if (indexes[0] && indexes[1]) {
                const indexFrom = parseInt(indexes[0]) - 1;
                const indexTo = parseInt(indexes[1]) - 1;
                if (indexFrom == indexTo)
                    this.removeSongFromQueue(indexFrom, message);
                else if (indexFrom < indexTo)
                    this.removeSongsRangeFromQueue(indexFrom, indexTo, message);
                else
                    this.removeSongsRangeFromQueue(indexTo, indexFrom, message);
            }
        }
    }

    /**
     * Removes a single entity from the queue
     *
     * @param {number} index the index in the queue
     * @param {Message} message the Discord message which requested to remove the music from the queue
     */
    removeSongFromQueue(index: number, message: Message): void {
        if (index < 0 || index > this.musicQueueArray.length) return;
        const removedSong = this.getYouTubeTitleFromCache(
            this.musicQueueArray[index]
        );
        this.removeYouTubeTitleFromCache(this.musicQueueArray[index]);
        if (index == 0 && this.musicQueueArray.length == 1)
            this.musicQueueArray = [];
        else this.musicQueueArray.splice(index, 1);
        this.elia.loggingComponent.log(
            message.author.username + " removed a song"
        );
        this.elia.messageComponent.reply(
            message,
            "Removed song: " + removedSong
        );
    }

    /**
     * Removes a range of music from the queue
     *
     * @param {number} from the first index in the queue
     * @param {number} to the last index in the queue
     * @param {Message} message the Discord message which requested to remove the music from the queue
     */
    removeSongsRangeFromQueue(
        from: number,
        to: number,
        message: Message
    ): void {
        const removedSongs: string[] = [];

        for (let i = from; i <= to; i++) {
            const song = this.musicQueueArray[i];
            if (song) {
                removedSongs.push(song);
            }
        }

        if (from == 0 && to == this.musicQueueArray.length - 1)
            this.musicQueueArray = [];
        else this.musicQueueArray.splice(from, to - from + 1);

        let reply = "***Removed " + removedSongs.length + " songs:***\n";
        for (const song of removedSongs) {
            const removedSong = this.getYouTubeTitleFromCache(song);
            this.removeYouTubeTitleFromCache(song);
            reply += removedSong + "\n";
        }
        this.elia.loggingComponent.log(
            message.author.username +
                " removed " +
                removedSongs.length +
                " songs"
        );

        message.reply(reply);
    }

    /**
     * Start's or stop's looping the current song in the queue
     *
     * @param {Message} message the Discord message which requested to loop the current song
     */
    loopCurrentSong(message: Message): void {
        if (this.isPlayingMusic) {
            if (this.isLoopingSong) {
                this.isLoopingSong = false;
                this.elia.messageComponent.reply(
                    message,
                    "You stopped looping the current song!"
                );
                this.elia.loggingComponent.log(
                    message.author.username +
                        " stopped looping the current song"
                );
            } else {
                this.isLoopingSong = true;
                this.elia.messageComponent.reply(
                    message,
                    "You started looping the current song!"
                );
                this.elia.loggingComponent.log(
                    message.author.username +
                        " started looping the current song"
                );
                if (
                    this.currentSong != null &&
                    (this.musicQueueArray.length == 0 ||
                        this.musicQueueArray[0] != this.currentSong)
                )
                    this.musicQueueArray.unshift(this.currentSong);
            }
        }
    }

    /**
     * Start's or stop's looping the current queue in the queue
     *
     * @param {Message} message the Discord message which requested to loop the queue
     */
    loopMusicQueue(message: Message): void {
        if (this.isPlayingMusic) {
            if (this.isLoopingQueue) {
                this.isLoopingQueue = false;
                this.elia.messageComponent.reply(
                    message,
                    "You stopped looping the queue!"
                );
                this.elia.loggingComponent.log(
                    message.author.username + " stopped looping the queue"
                );
            } else {
                this.isLoopingQueue = true;
                this.elia.messageComponent.reply(
                    message,
                    "You started looping the queue!"
                );
                this.elia.loggingComponent.log(
                    message.author.username + " started looping the queue"
                );
                if (this.currentSong != null && !this.isLoopingSong) {
                    this.musicQueueArray.push(this.currentSong);
                }
            }
        }
    }

    // --- YouTube functions ---

    /**
     * Imports and plays a YouTube playlist
     *
     * @param {Message} message the Discord message which requested to play a playlist
     * @param {VoiceChannel} voiceChannel the Discord channel where to play the music
     * @param {string} id the YouTube id of the playlist
     */
    async playYouTubePlaylist(
        message: Message,
        voiceChannel: VoiceChannel,
        id: string
    ): Promise<void> {
        const playlist = await ytpl(id, {});
        if (playlist.items.length > 1) {
            for (let i = 1; i < playlist.items.length; i++) {
                const item = playlist.items[i];
                if (item) {
                    this.musicQueueArray.push(item.url);
                }
            }
        }
        const first = playlist.items[0];
        if (first) {
            this.elia.messageComponent.reply(
                message,
                "You stared playing a YouTube Playlist!"
            );

            this.elia.loggingComponent.log(
                message.author.username + " imported a YouTube playlist"
            );
            this.playMusic(message, voiceChannel, first.url);
        }
    }

    /**
     * Caches a YouTube video's title
     *
     * @param {string} url the YouTube URL to the music
     */
    cacheYouTubeTitle(url: string): void {
        ytdl.getInfo(url).then((info) => {
            if (!this.titleMap.has(url)) {
                this.titleMap.set(url, info.videoDetails.title);
            }
        });
    }

    /**
     * Get's the video's title from the cache, if available
     *
     * @param {string} url the YouTube URL
     * @returns {?string} "Title not cached yet." or the title i found in the cache
     */
    getYouTubeTitleFromCache(url: string | undefined): string {
        if (url) {
            const title = this.titleMap.get(url);
            if (typeof title === "undefined") return "Title not cached yet.";
            else return title;
        }
        return "Title not cached yet.";
    }

    /**
     * Removes a video's title from the cache
     *
     * @param {?string} url the YouTube URL
     */
    removeYouTubeTitleFromCache(url: string | undefined): void {
        if (url && this.titleMap.has(url)) {
            this.titleMap.delete(url);
        }
    }

    // --- Queue state getter functions ---

    /**
     * Get's the current music queue, and sends it to the user
     *
     * @param {Message} message the Discord message which requested to get the queue
     */
    getQueuedMusic(message: Message): void {
        if (this.currentSong != null) {
            const currentTitle = this.getYouTubeTitleFromCache(
                this.currentSong
            );
            let reply = "\n***The current song: ***\n" + currentTitle;
            if (this.musicQueueArray.length > 0) {
                reply += "\n\n***The current queue:***\n";
                for (let i = 0; i < this.musicQueueArray.length; i++) {
                    const title = this.getYouTubeTitleFromCache(
                        this.musicQueueArray[i]
                    );
                    reply += i + 1 + ". " + title + "\n";
                }
            }
            message
                .reply(reply)
                .then((msg) =>
                    this.elia.messageComponent.deleteMsgTimeout(msg)
                );
            this.elia.messageComponent.deleteMsgNow(message);
        } else {
            this.elia.messageComponent.reply(
                message,
                "It seems there are no music in the queue."
            );
        }
    }

    /**
     * Get's the current song, and sends it to the user
     *
     * @param {Message} message the Discord message which requested to get the current song
     */
    getCurrentSong(message: Message): void {
        if (this.currentSong != null) {
            const currentTitle = this.getYouTubeTitleFromCache(
                this.currentSong
            );
            message
                .reply(
                    "***The current song is:***\n\n" +
                        currentTitle +
                        "at " +
                        this.currentSong
                )
                .then((msg) =>
                    this.elia.messageComponent.deleteMsgTimeout(msg)
                );
            this.elia.messageComponent.deleteMsgNow(message);
        } else {
            this.elia.messageComponent.reply(
                message,
                "It seems there is no music playing."
            );
        }
    }

    // --- Discord state checker functions ---

    /**
     * Check's if the bot is playing songs to itself.
     *
     * @returns {boolean} true if the bot is alone in the VoiceChannel, else false
     */
    hasMembersInVoice(): boolean {
        if (
            this.voiceChannel != null &&
            this.elia.bot.user &&
            this.voiceChannel.members.has(this.elia.bot.user.id) &&
            this.voiceChannel.members.size == 1 &&
            !this.elia.dataComponent.getRadioMode()
        ) {
            this.elia.loggingComponent.log("Elia was left alone...");
            return false;
        } else return true;
    }
}
