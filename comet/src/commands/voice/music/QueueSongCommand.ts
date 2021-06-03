import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import ytSearch from "yt-search";
import validURL from "../../../components/music/UrlChecker.js";

export default class QueueSongCommand extends Command {
    name = "queue";
    description =
        "Queue a video from youtube, if no music plays starts playing it.";
    usage =
        " *required:* <Youtube link> *or search terms:* <term1> <term2> <term3> ...";
    hasArguments = true;
    type = CommandTypeEnum.MUSIC;
    async execute(message: Message, args: string[], elia: Elia): Promise<void> {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        ) {
            const arg = args[0];
            if (arg && validURL(arg)) {
                elia.musicComponent?.queueMusic(message, arg);
            } else {
                const videoFinder = async (query: string) => {
                    const videoResult = await ytSearch(query);
                    return videoResult.videos.length > 1
                        ? videoResult.videos[0]
                        : null;
                };

                const video = await videoFinder(args.join(" "));

                if (video) {
                    elia.musicComponent?.queueMusic(message, video.url);
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
