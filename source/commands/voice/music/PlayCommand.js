const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");
const ytSearch = require("yt-search");
const validURL = require("../../../components/music/UrlChecker.js");
const getYouTubePlaylistId = require("../../../components/music/UrlPlaylist.js");
const { VoiceChannel, Message } = require("discord.js");
const Elia = require("../../../Elia");

class PlayCommand extends Command {
    name = "play";
    description = "Joins and plays a video from youtube";
    usage =
        " *required:* <Youtube link> *or search terms:* <term1> <term2> <term3> ...";
    type = CommandTypeEnum.MUSIC;
    hasArguments = true;
    async execute(message, args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        ) {
            const voiceChannel =
                await elia.musicComponent.musicQueue.getVoiceChannel(
                    message.member.voice.channel,
                    message
                );
            if (validURL(args[0])) {
                this.playFromYouTube(voiceChannel, message, elia, args[0]);
            } else {
                this.searchAndPlayFromYouTube(
                    voiceChannel,
                    message,
                    args.join(" "),
                    elia
                );
            }
        }
    }

    /**
     * Play's a video or playlist from YouTube
     *
     * @param {VoiceChannel} voiceChannel the VoiceChannel to join
     * @param {Message} message the message which requested the music
     * @param {Elia} elia the elia bot
     * @param {string} url a youtube video url
     */
    playFromYouTube(voiceChannel, message, elia, url) {
        const id = getYouTubePlaylistId(url);
        if (id != null)
            elia.musicComponent.musicQueue.playYouTubePlaylist(
                message,
                voiceChannel,
                id
            );
        else
            elia.musicComponent.musicQueue.playMusic(
                message,
                voiceChannel,
                url
            );
    }

    /**
     * Searches a query in YouTube and then play's the first video result match, if result exits
     *
     * @param {VoiceChannel} voiceChannel the VoiceChannel to join
     * @param {Message} message the message which requested the music
     * @param {string} query the search terms in one string
     * @param {Elia} elia the elia bot
     */
    searchAndPlayFromYouTube(voiceChannel, message, query, elia) {
        const video = this.videoFinder(query);
        if (video) {
            elia.musicComponent.musicQueue.playMusic(
                message,
                voiceChannel,
                video.url,
                video.title
            );
        } else {
            elia.messageComponent.reply(message, "No video results found.");
        }
    }

    /**
     * Searches a srting on YouTube and get the fist result.
     *
     * @param {string} query the string to search on YouTube
     * @returns {?string} the first result of the query or null if no results
     */
    async videoFinder(query) {
        const videoResult = await ytSearch(query);
        return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
    }
}

module.exports = PlayCommand;
