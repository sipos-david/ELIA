const playFromURL = require("../tools/urlPlay.js");
const getYoutubeTitle = require("get-youtube-title");
const getYouTubeID = require("get-youtube-id");
const playMusicCommand = require("../commands/play.js");

class MusicQueue {
    constructor(bot) {
        this.bot = bot;
    }

    musicQueueArray = new Array();
    playingMusic = false;
    voiceChannel = null;
    connection = null;
    currentSong = null;

    continuePlayingMusic() {
        if (this.musicQueueArray.length > 0) {
            this.playMusicFromQueue();
        } else {
            this.voiceChannel.leave();
            this.bot.activityDisplay.setDefault();
        }
    }

    async playMusic(msg, voiceChannel, url, title = null) {
        this.musicQueueArray.unshift(url);

        if (this.voiceChannel == null) {
            this.voiceChannel = voiceChannel;
            this.connection = await voiceChannel.join();
        } else if (voiceChannel.id != this.voiceChannel.id) {
            this.voiceChannel.leave();
            this.voiceChannel = voiceChannel;
            this.connection = await voiceChannel.join();
        }

        this.playMusicFromQueue(msg, title);
    }

    async queueMusic(msg, url) {
        await msg.reply(":musical_note: Queued: ***" + url + "***");
        console.log(msg.author.username + " queued: " + url);
        if (this.musicQueueArray.push(url) == 1) {
            this.bot.musicQueue.playMusic(msg, msg.member.voice.channel, url);
        }
    }

    stopMusic() {
        this.musicQueueArray = new Array();
        this.playingMusic = false;
        if (this.voiceChannel != null) this.voiceChannel.leave();
        this.connection = null;
        this.currentSong = null;
    }

    async skipSong(msg) {
        msg.reply("You skipped a song!");
        this.continuePlayingMusic();
    }

    async getQueuedMusic(msg) {
        if (this.musicQueueArray.lentgh > 0) {
            let replyMsg = "***The current queue:***\n\n";

            let currentId = getYouTubeID(this.currentSong);
            let currenTitle = await this.getYoutubeTitleFromId(currentId);
            replyMsg += "1. " + currenTitle + "\n";

            let i;
            for (i = 0; i < this.musicQueueArray.length; i++) {
                let id = getYouTubeID(this.musicQueueArray[i]);
                let title = await this.getYoutubeTitleFromId(id);
                replyMsg += i + 2 + ". " + title + "\n";
            }
            msg.reply(replyMsg);
        } else {
            msg.reply("It seems there is no music playing.");
        }
    }

    getYoutubeTitleFromId(id) {
        return new Promise((resolve, reject) => {
            getYoutubeTitle(id, function (err, title) {
                resolve(title);
            });
        });
    }

    pauseMusic() {
        if (
            this.playingMusic &&
            this.voiceChannel != null &&
            this.connection != null
        ) {
            this.connection.dispatcher.pause();
        }
    }

    resumeMusic() {
        if (
            this.playingMusic &&
            this.voiceChannel != null &&
            this.connection != null
        ) {
            this.connection.dispatcher.resume();
        }
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
            msg.reply("It seems there is no music playing.");
        }
    }

    playMusicFromQueue(msg, title = null) {
        if (this.musicQueueArray.length > 0) {
            if (this.playingMusic) this.pauseMusic();

            this.currentSong = this.musicQueueArray.shift();

            playFromURL(
                this.bot,
                msg,
                this.connection,
                this.currentSong,
                title
            );
        }
    }
}

module.exports = MusicQueue;
