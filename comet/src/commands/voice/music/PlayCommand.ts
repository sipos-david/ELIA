import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import isValidURL from "../../../lib/UrlChecker";
import { VoiceChannel, Message } from "discord.js";
import Elia from "../../../Elia";
import YoutubeService from "../../../components/music/YoutubeService";

export default class PlayCommand extends Command {
    constructor(youtubeService: YoutubeService) {
        super();
        this.youtubeService = youtubeService;
    }
    youtubeService: YoutubeService;

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
                    if (arg && isValidURL(arg)) {
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
    async playFromYouTube(
        voiceChannel: VoiceChannel,
        message: Message,
        elia: Elia,
        url: string
    ): Promise<void> {
        const id = this.youtubeService.getPlaylistIdFromUrl(url);
        if (id != null)
            elia.musicComponent?.playYouTubePlaylist(message, voiceChannel, id);
        else {
            const video = await this.youtubeService.getMusicFromUrl(url);
            if (video) {
                elia?.musicComponent?.startPlayingMusic(
                    message,
                    voiceChannel,
                    video
                );
            }
        }
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
        const video = await this.youtubeService.getMusicFromQuery(query);
        if (video) {
            elia.musicComponent?.startPlayingMusic(
                message,
                voiceChannel,
                video
            );
        } else {
            elia.messageComponent.reply(message, "No video results found.");
        }
    }
}
