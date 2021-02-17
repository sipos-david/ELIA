const playFromURL = require("./UrlPlay.js");
const getYoutubeTitle = require("get-youtube-title");
const getYouTubeID = require("get-youtube-id");
const ytpl = require("ytpl");

class MusicQueue {
    constructor(newELia) {
        this.elia = newELia;
    }

    musicQueueArray = new Array();
    playingMusic = false;
    voiceChannel = null;
    connection = null;
    currentSong = null;
    paused = false;
    lastSong = null;
    loopSong = false;
    loopQueue = false;

    continuePlayingMusic() {
        if (this.musicQueueArray.length > 0) {
            this.playMusicFromQueue();
        } else {
            this.stopMusic();
        }
    }

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

    async playMusic(msg, voiceChannel, url, title = null) {
        if (voiceChannel == null) return;

        if (this.currentSong != null)
            this.musicQueueArray.unshift(this.currentSong);

        this.musicQueueArray.unshift(url);
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

    stopMusic() {
        this.musicQueueArray = new Array();
        this.playingMusic = false;
        this.pauseMusic = false;
        if (this.voiceChannel != null) {
            this.voiceChannel.leave();
            elia.messageComponent.reply(
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

    async skipSong(msg) {
        this.elia.messageComponent.reply(msg, "You skipped a song!");
        this.elia.loggingComponent.log(msg.author.username + " skipped a song");
        this.continuePlayingMusic();
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

    async getQueuedMusic(msg) {
        if (this.currentSong != null) {
            let currentId = getYouTubeID(this.currentSong);
            let currenTitle = await this.getYoutubeTitleFromId(currentId);
            let replyMsg = "\n***The current song: ***\n" + currenTitle;
            if (this.musicQueueArray.length > 0) {
                replyMsg += "\n\n***The current queue:***\n";
                for (let i = 0; i < this.musicQueueArray.length; i++) {
                    let id = getYouTubeID(this.musicQueueArray[i]);
                    let title = await this.getYoutubeTitleFromId(id);
                    replyMsg += i + 1 + ". " + title + "\n";
                }
            }
            msg.reply(replyMsg);
        } else {
            this.elia.messageComponent.reply(
                msg,
                "It seems there are no music in the queue."
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
        let removedSong = await this.getYoutubeTitleFromId(
            getYouTubeID(this.musicQueueArray[index])
        );
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
            let removedSong = await this.getYoutubeTitleFromId(
                getYouTubeID(removedSongs[i])
            );
            replyMsg += removedSong + "\n";
        }
        this.elia.loggingComponent.log(
            msg.author.username + " removed " + removedSongs.length + " songs"
        );

        msg.reply(replyMsg);
    }

    getYoutubeTitleFromId(id) {
        return new Promise((resolve, reject) => {
            getYoutubeTitle(id, function (err, title) {
                resolve(title);
            });
        });
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
        msg.delete();
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
        msg.delete();
    }

    async getCurrentSong(msg) {
        if (this.currentSong != null) {
            let currentId = getYouTubeID(this.currentSong);
            let currenTitle = await this.getYoutubeTitleFromId(currentId);
            msg.reply(
                "***The current song is:***\n\n" +
                    currenTitle +
                    "at " +
                    this.currentSong
            );
        } else {
            this.elia.messageComponent.reply(
                msg,
                "It seems there is no music playing."
            );
        }
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

    playMusicFromQueue(msg, title = null) {
        if (this.musicQueueArray.length > 0) {
            this.lastSong = this.currentSong;
            this.currentSong = this.musicQueueArray.shift();
            if (this.lastSong == null) this.lastSong = this.currentSong;
            if (this.loopSong) this.musicQueueArray.unshift(this.currentSong);
            if (this.loopQueue && !this.loopSong)
                this.musicQueueArray.push(this.currentSong);
            playFromURL(
                this.elia,
                msg,
                this.connection,
                this.currentSong,
                title
            );
        }
    }
}

module.exports = MusicQueue;
