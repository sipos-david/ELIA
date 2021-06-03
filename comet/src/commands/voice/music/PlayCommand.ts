import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import ytSearch from "yt-search";
import validURL from "../../../components/music/UrlChecker";
import getYouTubePlaylistId from "../../../components/music/UrlPlaylist";
import { VoiceChannel, Message } from "discord.js";
import Elia from "../../../Elia";

export default class PlayCommand extends Command {
    name = "play";
    description = "Joins and plays a video from youtube";
    usage =
        " *required:* <Youtube link> *or search terms:* <term1> <term2> <term3> ...";
    type = CommandTypeEnum.MUSIC;
    hasArguments = true;

    async execute(message: Message, args: string[], elia: Elia): Promise<void> {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        ) {
            if (message.member && message.member.voice.channel) {
                const voiceChannel = await elia.musicComponent?.getVoiceChannel(
                    message.member.voice.channel,
                    message
                );
                if (voiceChannel) {
                    const arg = args[0];
                    if (arg && validURL(arg)) {
                        this.playFromYouTube(voiceChannel, message, elia, arg);
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
    playFromYouTube(
        voiceChannel: VoiceChannel,
        message: Message,
        elia: Elia,
        url: string
    ): void {
        const id = getYouTubePlaylistId(url);
        if (id != null)
            elia.musicComponent?.musicQueue?.playYouTubePlaylist(
                message,
                voiceChannel,
                id
            );
        else
            elia?.musicComponent?.musicQueue?.playMusic(
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
    async searchAndPlayFromYouTube(
        voiceChannel: VoiceChannel,
        message: Message,
        query: string,
        elia: Elia
    ): Promise<void> {
        const video = await this.videoFinder(query);
        if (video) {
            elia.musicComponent?.musicQueue?.playMusic(
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
     * Searches a string on YouTube and get the fist result.
     *
     * @param {string} query the string to search on YouTube
     * @returns {?string} the first result of the query or null if no results
     */
    async videoFinder(
        query: string
    ): Promise<ytSearch.VideoSearchResult | undefined> {
        const videoResult = await ytSearch(query);
        return videoResult.videos.length > 1
            ? videoResult.videos[0]
            : undefined;
    }
}
