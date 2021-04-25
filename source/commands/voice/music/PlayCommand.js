const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");
const ytSearch = require("yt-search");
const validURL = require("../../../components/music/UrlChecker.js");
const getYouTubePlaylistId = require("../../../components/music/UrlPlaylist.js");

class PlayCommand extends Command {
    name = "play";
    description = "Joins and plays a video from youtube";
    usage =
        " *required:* <Youtube link> *or search terms:* <term1> <term2> <term3> ...";
    type = CommandTypeEnum.MUSIC;
    hasArguments = true;
    async execute(message, args, elia) {
        if (
            elia.musicComponent.messageSenderHasRightPermissions(message) &&
            elia.musicComponent.messageSenderInVoiceChannel(message)
        ) {
            const voiceChannel = message.member.voice.channel;
            if (validURL(args[0])) {
                let id = getYouTubePlaylistId(args[0]);
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
                        args[0]
                    );
            } else {
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return videoResult.videos.length > 1
                        ? videoResult.videos[0]
                        : null;
                };

                const video = await videoFinder(args.join(" "));

                if (video) {
                    elia.musicComponent.musicQueue.playMusic(
                        message,
                        voiceChannel,
                        video.url,
                        video.title
                    );
                } else {
                    elia.messageComponent.reply(
                        message,
                        "No video results found."
                    );
                }
            }
        }
    }
}

module.exports = PlayCommand;
