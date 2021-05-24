const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");
const ytSearch = require("yt-search");
const validURL = require("../../../components/music/UrlChecker.js");

class QueueSongCommand extends Command {
    name = "queue";
    description =
        "Queue a video from youtube, if no music plays starts playing it.";
    usage =
        " *required:* <Youtube link> *or search terms:* <term1> <term2> <term3> ...";
    hasArguments = true;
    type = CommandTypeEnum.MUSIC;
    async execute(message, args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        ) {
            if (validURL(args[0])) {
                elia.musicComponent.musicQueue.queueMusic(message, args[0]);
            } else {
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return videoResult.videos.length > 1
                        ? videoResult.videos[0]
                        : null;
                };

                const video = await videoFinder(args.join(" "));

                if (video) {
                    elia.musicComponent.musicQueue.queueMusic(
                        message,
                        video.url
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

module.exports = QueueSongCommand;
