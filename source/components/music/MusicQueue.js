const Elia = require("../../Elia.js");
const { VoiceConnection, VoiceChannel, Message } = require("discord.js");
const playFromURL = require("./UrlPlay.js");
const ytpl = require("ytpl");
const ytdl = require("ytdl-core");

/**
 * A music queue that play's music.
 */
class MusicQueue {
    /**
     * @param {Elia} elia the Elia object the music queue uses
     */
    constructor(elia) {
        /**
         * The ELIA object
         *
         * @type {Elia}
         */
        this.elia = elia;
    }

    // --- Music ---

    /**
     * Array of YouTube links
     *
     * @type {Array<string>}
     */
    musicQueueArray = new Array();
    /**
     * The cache for YouTube titles
     *
     * Key is YouTube ID,
     * Value is the title
     *
     * @type {Map<string,string>}
     */
    titleMap = new Map();
    /**
     * YouTube link to the last song
     *
     * @type {?string}
     */
    lastSong = null;
    /**
     * YouTube link to the current song
     *
     * @type {?string}
     */
    currentSong = null;
    /**
     * The current song's name
     *
     * @type {?string}
     */
    currentSongName = null;

    // --- Discord data ---

    /**
     * The joined voice channel, null if not joined any
     *
     * @type {?VoiceChannel}
     */
    voiceChannel = null;
    /**
     * The joined voice channel, null if not joined any
     *
     * @type {?VoiceConnection}
     */
    connection = null;

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
    async playMusic(message, voiceChannel, url, title = null) {
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
     * Get the vocie channel from message
     *
     * @param {VoiceChannel} voiceChannel the voice channel the user is in
     * @param {Message} message the message that has the music command
     * @returns {VoiceChannel} the new music voice channel
     */
    async getVoiceChannel(voiceChannel, message) {
        if (this.elia.dataComponent.getRadioMode()) {
            const radioChannel = this.elia.dataComponent.getRadioChannel(
                message.channel.guild.id
            );
            if (radioChannel) {
                const radioVoiceChannel =
                    this.elia.bot.channels.cache.get(radioChannel);
                if (radioVoiceChannel) {
                    return radioVoiceChannel;
                } else {
                    this.elia.messageComponent.reply(
                        message,
                        "Radio channel not avaliable for current server!"
                    );
                }
            }
        } else {
            return voiceChannel;
        }
    }

    /**
     * Replay's the current song
     *
     * @param {Message} message the Discord message which requested the replay
     */
    async replayMusic(message) {
        if (this.lastSong != null) {
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
    stopMusic(message) {
        this.musicQueueArray = new Array();
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
        this.currentSong = null;
        this.isLoopingSong = false;
        this.isLoopingQueue = false;
        this.elia.activityDisplayComponent.setDefault();
    }

    /**
     * Pauses the music
     *
     * @param {Message} message the Discord message which requested the pause
     */
    async pauseMusic(message) {
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
    async resumeMusic(message) {
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
    playMusicFromQueue(message = null, title = null) {
        if (this.musicQueueArray.length > 0) {
            this.lastSong = this.currentSong;
            this.currentSong = this.musicQueueArray.shift();
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

    /**
     * Queues a music from YouTube
     *
     * @param {Message} message the Discord message which requested to queue a song,
     * @param {string} url YouTube link to the music
     */
    async queueMusic(message, url) {
        this.elia.messageComponent.reply(
            message,
            ":musical_note: Queued: ***" + url + "***"
        );
        this.elia.loggingComponent.log(
            message.author.username + " queued: " + url
        );
        if (this.musicQueueArray.push(url) == 1 && !this.isPlayingMusic) {
            const voiceChannel = this.getVoiceChannel(
                message.member.voice.channel,
                message
            );
            this.playMusic(message, voiceChannel, url);
        }
    }

    /**
     * Continues playing music if the queue is not empty
     */
    continuePlayingMusic() {
        if (this.musicQueueArray.length > 0 && this.hasMembersInVoice()) {
            this.playMusicFromQueue();
        } else {
            this.stopMusic();
        }
    }

    // --- Queue manipulation functions ---

    /**
     * Skip's a song
     *
     * @param {Message} message the Discord message which requested to skip a song
     */
    async skipSong(message) {
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
    shuffleMusic(message) {
        if (this.musicQueueArray.length >= 2) {
            for (var i = this.musicQueueArray.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = this.musicQueueArray[i];
                this.musicQueueArray[i] = this.musicQueueArray[j];
                this.musicQueueArray[j] = temp;
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
    removeFromQueue(number, message) {
        if (number.indexOf("-") === -1) {
            this.removeSongFromQueue(parseInt(number) - 1, message);
        } else {
            let indexes = number.split("-");
            if (indexes.length <= 1) return;
            let indexFrom = parseInt(indexes[0]) - 1;
            let indexTo = parseInt(indexes[1]) - 1;
            if (indexFrom == indexTo)
                this.removeSongFromQueue(indexFrom, message);
            else if (indexFrom < indexTo)
                this.removeSongsRangeFromQueue(indexFrom, indexTo, message);
            else this.removeSongsRangeFromQueue(indexTo, indexFrom, message);
        }
    }

    /**
     * Removes a single entity from the queue
     *
     * @param {number} index the index in the queue
     * @param {Message} message the Discord message which requested to remove the music from the queue
     */
    async removeSongFromQueue(index, message) {
        if (index < 0 || index > this.musicQueueArray.length) return;
        let removedSong = this.getYouTubeTitleFromCache(
            this.musicQueueArray[index]
        );
        this.removeYouTubeTitleFromCache(this.musicQueueArray[index]);
        if (index == 0 && this.musicQueueArray.length == 1)
            this.musicQueueArray = new Array();
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
    async removeSongsRangeFromQueue(from, to, message) {
        let removedSongs = new Array();

        for (let i = from; i <= to; i++) {
            removedSongs.push(this.musicQueueArray[i]);
        }

        if (from == 0 && to == this.musicQueueArray.length - 1)
            this.musicQueueArray = new Array();
        else this.musicQueueArray.splice(from, to - from + 1);

        let reply = "***Removed " + removedSongs.length + " songs:***\n";
        for (let song of removedSongs) {
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
    loopCurrentSong(message) {
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
                    (this.musicQueueArray.lenth == 0 ||
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
    loopMusicQueue(message) {
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
    async playYouTubePlaylist(message, voiceChannel, id) {
        let playlist = await ytpl(id, {});
        if (playlist.items.length > 1) {
            for (let i = 1; i < playlist.items.length; i++) {
                this.musicQueueArray.push(playlist.items[i].url);
            }
        }
        this.elia.messageComponent.reply(
            message,
            "You stared playing a YouTube Playlist!"
        );

        this.elia.loggingComponent.log(
            message.author.username + " imported a YouTube playlist"
        );
        this.playMusic(message, voiceChannel, playlist.items[0].url);
    }

    /**
     * Caches a YouTube video's title
     *
     * @param {string} url the YouTube URL to the music
     */
    async cacheYouTubeTitle(url) {
        ytdl.getInfo(url).then((info) => {
            if (!this.titleMap.has(url)) {
                this.titleMap.set(url, info.videoDetails.title);
            }
        });
    }

    /**
     * Get's the video's title from the cache, if avaliable
     *
     * @param {string} url the YouTube URL
     * @returns {string} "Title not cached yet." or the title i found in the cache
     */
    getYouTubeTitleFromCache(url) {
        let title = this.titleMap.get(url);
        if (typeof title === "undefined") return "Title not cached yet.";
        else return title;
    }

    /**
     * Removes a video's title from the cache
     *
     * @param {string} url the YouTube URL
     */
    removeYouTubeTitleFromCache(url) {
        if (this.titleMap.has(url)) {
            this.titleMap.delete(url);
        }
    }

    // --- Queue state getter functions ---

    /**
     * Get's the current music queue, and send's it to the user
     *
     * @param {Message} message the Discord message which requested to get the queue
     */
    async getQueuedMusic(message) {
        if (this.currentSong != null) {
            let currenTitle = this.getYouTubeTitleFromCache(this.currentSong);
            let reply = "\n***The current song: ***\n" + currenTitle;
            if (this.musicQueueArray.length > 0) {
                reply += "\n\n***The current queue:***\n";
                for (let i = 0; i < this.musicQueueArray.length; i++) {
                    let title = this.getYouTubeTitleFromCache(
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
     * Get's the current song, and send's it to the user
     *
     * @param {Message} message the Discord message which requested to get the current song
     */
    async getCurrentSong(message) {
        if (this.currentSong != null) {
            let currenTitle = this.getYouTubeTitleFromCache(this.currentSong);
            message
                .reply(
                    "***The current song is:***\n\n" +
                        currenTitle +
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
    hasMembersInVoice() {
        if (
            this.voiceChannel != null &&
            this.voiceChannel.members.has(this.elia.bot.user.id) &&
            this.voiceChannel.members.size == 1 &&
            !this.elia.dataComponent.getRadioMode()
        ) {
            this.elia.loggingComponent.log("Elia was left alone...");
            return false;
        } else return true;
    }
}

module.exports = MusicQueue;
