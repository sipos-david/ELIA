const playFromURL = require("./UrlPlay.js");
const ytpl = require("ytpl");
const ytdl = require("ytdl-core");

/**
 * A music queue that play's music.
 */
class MusicQueue {
    constructor(newELia) {
        this.elia = newELia;
    }
    // --- Music ---
    /**
     * Array of Youtube links
     */
    musicQueueArray = new Array();
    /**
     * The cache for youtube titles
     *
     * Key is youtube ID,
     * Value is the title
     */
    titleMap = new Map();
    /**
     * Youtube link to the last song
     */
    lastSong = null;
    /**
     * Youtube link to the current song
     */
    currentSong = null;
    currentSongName = null;

    // --- Discord data ---
    voiceChannel = null;
    connection = null;

    // --- Flags ---
    paused = false;
    playingMusic = false;
    loopSong = false;
    loopQueue = false;

    // --- Music control functions ---

    async playMusic(msg, voiceChannel, url, title = null) {
        if (voiceChannel == null) return;

        if (this.currentSong != null)
            this.musicQueueArray.unshift(this.currentSong);

        this.musicQueueArray.unshift(url);
        this.cacheYoutubeTitle(url);
        this.playingMusic = true;

        if (
            this.voiceChannel == null ||
            voiceChannel.id != this.voiceChannel.id
        ) {
            this.voiceChannel = voiceChannel;
            this.connection = await voiceChannel.join();
        }

        this.playMusicFromQueue(msg, title);
    }

    async replayMusic(msg) {
        if (this.lastSong != null) {
            this.elia.musicComponent.musicQueue.playMusic(
                msg,
                msg.member.voice.channel,
                this.lastSong
            );
            this.elia.messageComponent.reply(msg, "You replayed a song!");
            this.elia.loggingComponent.log(
                msg.author.username + " replayed a song"
            );
        } else {
            this.elia.messageComponent.reply(
                msg,
                "It seems there are no song to replay."
            );
        }
    }

    stopMusic(message) {
        this.musicQueueArray = new Array();
        this.titleMap = new Map();
        this.playingMusic = false;
        this.pauseMusic = false;
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
        this.loopSong = false;
        this.loopQueue = false;
        this.elia.activityDisplayComponent.setDefault();
    }

    async pauseMusic(msg) {
        if (
            !this.paused &&
            this.voiceChannel != null &&
            this.connection != null
        ) {
            this.paused = true;
            if (this.connection.dispatcher != null) {
                this.connection.dispatcher.pause();
                this.elia.messageComponent.reply(msg, "You paused the music.");
                this.elia.loggingComponent.log(
                    msg.author.username + " paused the music"
                );
            }
        } else {
            this.elia.messageComponent.reply(
                msg,
                "You can't pause the music right now."
            );
        }
    }

    async resumeMusic(msg) {
        if (
            this.paused &&
            this.voiceChannel != null &&
            this.connection != null
        ) {
            this.paused = false;
            if (this.connection.dispatcher != null) {
                this.elia.messageComponent.reply(
                    msg,
                    "You resumed playing the music."
                );
                this.elia.loggingComponent.log(
                    msg.author.username + " resumed playing the music"
                );
            }
            this.connection.dispatcher.resume();
        } else {
            this.elia.messageComponent.reply(
                msg,
                "You can't resume the music right now."
            );
        }
    }

    playMusicFromQueue(msg, title = null) {
        if (this.musicQueueArray.length > 0) {
            this.lastSong = this.currentSong;
            this.currentSong = this.musicQueueArray.shift();
            if (this.lastSong == null) this.lastSong = this.currentSong;
            if (this.loopSong) this.musicQueueArray.unshift(this.currentSong);
            if (this.loopQueue && !this.loopSong)
                this.musicQueueArray.push(this.currentSong);
            this.elia.activityDisplayComponent.setMusicPlaying();
            playFromURL(
                this.elia,
                msg,
                this.connection,
                this.currentSong,
                title
            );
        }
    }

    async queueMusic(msg, url) {
        await this.elia.messageComponent.reply(
            msg,
            ":musical_note: Queued: ***" + url + "***"
        );
        this.elia.loggingComponent.log(msg.author.username + " queued: " + url);
        if (this.musicQueueArray.push(url) == 1 && this.playingMusic == false) {
            this.playMusic(msg, msg.member.voice.channel, url);
        }
    }

    continuePlayingMusic() {
        if (this.musicQueueArray.length > 0 && this.hasMembersInVoice()) {
            this.playMusicFromQueue();
        } else {
            this.stopMusic();
        }
    }

    // --- Queue manipulation functions ---

    async skipSong(msg) {
        this.elia.messageComponent.reply(msg, "You skipped a song!");
        this.elia.loggingComponent.log(msg.author.username + " skipped a song");
        this.continuePlayingMusic();
    }

    shuffleMusic(msg) {
        if (this.musicQueueArray.length >= 2) {
            for (var i = this.musicQueueArray.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = this.musicQueueArray[i];
                this.musicQueueArray[i] = this.musicQueueArray[j];
                this.musicQueueArray[j] = temp;
            }
            this.elia.messageComponent.reply(msg, "You shuffled the music.");
            this.elia.loggingComponent.log(
                msg.author.username + " shuffled the music"
            );
        }
    }

    removeFromQueue(number, msg) {
        if (number.indexOf("-") === -1) {
            this.removeSongFromQueue(parseInt(number) - 1, msg);
        } else {
            let indexes = number.split("-");
            if (indexes.length <= 1) return;
            let indexFrom = parseInt(indexes[0]) - 1;
            let indexTo = parseInt(indexes[1]) - 1;
            if (indexFrom == indexTo) this.removeSongFromQueue(indexFrom, msg);
            else if (indexFrom < indexTo)
                this.removeSongsRangeFromQueue(indexFrom, indexTo, msg);
            else this.removeSongsRangeFromQueue(indexTo, indexFrom, msg);
        }
    }

    async removeSongFromQueue(index, msg) {
        if (index < 0 || index > this.musicQueueArray.length) return;
        let removedSong = this.getYoutubeTitleFromCache(
            this.musicQueueArray[index]
        );
        this.removeYoutubeTitleFromCache(this.musicQueueArray[index]);
        if (index == 0 && this.musicQueueArray.length == 1)
            this.musicQueueArray = new Array();
        else this.musicQueueArray.splice(index, 1);
        this.elia.loggingComponent.log(msg.author.username + " removed a song");
        this.elia.messageComponent.reply(msg, "Removed song: " + removedSong);
    }

    async removeSongsRangeFromQueue(indexFrom, indexTo, msg) {
        let removedSongs = new Array();

        for (let i = indexFrom; i <= indexTo; i++) {
            removedSongs.push(this.musicQueueArray[i]);
        }

        if (indexFrom == 0 && indexTo == this.musicQueueArray.length - 1)
            this.musicQueueArray = new Array();
        else this.musicQueueArray.splice(indexFrom, indexTo - indexFrom + 1);

        let replyMsg = "***Removed " + removedSongs.length + " songs:***\n";
        for (let i = 0; i < removedSongs.length; i++) {
            let removedSong = this.getYoutubeTitleFromCache(removedSongs[i]);
            this.removeYoutubeTitleFromCache(this.musicQueueArray[index]);
            replyMsg += removedSong + "\n";
        }
        this.elia.loggingComponent.log(
            msg.author.username + " removed " + removedSongs.length + " songs"
        );

        msg.reply(replyMsg);
    }

    loopCurrentSong(msg) {
        if (this.playingMusic) {
            if (this.loopSong) {
                this.loopSong = false;
                this.elia.messageComponent.reply(
                    msg,
                    "You stopped looping the current song!"
                );
                this.elia.loggingComponent.log(
                    msg.author.username + " stopped looping the current song"
                );
            } else {
                this.loopSong = true;
                this.elia.messageComponent.reply(
                    msg,
                    "You started looping the current song!"
                );
                this.elia.loggingComponent.log(
                    msg.author.username + " started looping the current song"
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

    loopMusicQueue(msg) {
        if (this.playingMusic) {
            if (this.loopQueue) {
                this.loopQueue = false;
                this.elia.messageComponent.reply(
                    msg,
                    "You stopped looping the queue!"
                );
                this.elia.loggingComponent.log(
                    msg.author.username + " stopped looping the queue"
                );
            } else {
                this.loopQueue = true;
                this.elia.messageComponent.reply(
                    msg,
                    "You started looping the queue!"
                );
                this.elia.loggingComponent.log(
                    msg.author.username + " started looping the queue"
                );
                if (this.currentSong != null && !this.loopSong) {
                    this.musicQueueArray.push(this.currentSong);
                }
            }
        }
    }

    // --- Youtube functions ---

    async playYoutubePlaylist(msg, voiceChannel, id) {
        let playlist = await ytpl(id, {});
        if (playlist.items.length > 1) {
            for (let i = 1; i < playlist.items.length; i++) {
                this.musicQueueArray.push(playlist.items[i].url);
            }
        }
        this.elia.messageComponent.reply(
            msg,
            "You stared playing a Youtube Playlist!"
        );

        this.elia.loggingComponent.log(
            msg.author.username + " imported a youtube playlist"
        );
        this.playMusic(msg, voiceChannel, playlist.items[0].url);
    }

    async cacheYoutubeTitle(url) {
        ytdl.getInfo(url).then((info) => {
            if (!this.titleMap.has(url)) {
                this.titleMap.set(url, info.videoDetails.title);
            }
        });
    }

    getYoutubeTitleFromCache(url) {
        let title = this.titleMap.get(url);
        if (typeof title === "undefined") return "Title not cached yet.";
        else return title;
    }

    removeYoutubeTitleFromCache(url) {
        if (this.titleMap.has(url)) {
            this.titleMap.delete(url);
        }
    }

    // --- Queue state getter functions ---

    //TODO better format
    async getQueuedMusic(msg) {
        if (this.currentSong != null) {
            let currenTitle = this.getYoutubeTitleFromCache(this.currentSong);
            let replyMsg = "\n***The current song: ***\n" + currenTitle;
            if (this.musicQueueArray.length > 0) {
                replyMsg += "\n\n***The current queue:***\n";
                for (let i = 0; i < this.musicQueueArray.length; i++) {
                    let title = await this.getYoutubeTitleFromCache(
                        this.musicQueueArray[i]
                    );
                    replyMsg += i + 1 + ". " + title + "\n";
                }
            }
            msg.reply(replyMsg).then((msg) =>
                this.elia.messageComponent.deleteMsgTimeout(msg)
            );
            this.elia.messageComponent.deleteMsgNow(msg);
        } else {
            this.elia.messageComponent.reply(
                msg,
                "It seems there are no music in the queue."
            );
        }
    }

    async getCurrentSong(msg) {
        if (this.currentSong != null) {
            let currenTitle = this.getYoutubeTitleFromCache(this.currentSong);
            msg.reply(
                "***The current song is:***\n\n" +
                    currenTitle +
                    "at " +
                    this.currentSong
            ).then((msg) => this.elia.messageComponent.deleteMsgTimeout(msg));
            this.elia.messageComponent.deleteMsgNow(msg);
        } else {
            this.elia.messageComponent.reply(
                msg,
                "It seems there is no music playing."
            );
        }
    }

    // --- Discord state checker functions ---

    hasMembersInVoice() {
        if (
            this.voiceChannel != null &&
            this.voiceChannel.members.has(this.elia.bot.user.id) &&
            this.voiceChannel.members.size == 1
        ) {
            this.elia.loggingComponent.log("Elia was left alone...");
            return false;
        } else return true;
    }
}

module.exports = MusicQueue;
