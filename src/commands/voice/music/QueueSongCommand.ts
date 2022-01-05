import { Message, VoiceChannel } from "discord.js";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import isValidURL from "../../../lib/UrlChecker.js";
import YoutubeService from "../../../services/YoutubeService";
import EliaInstance from "../../../EliaInstance";

export default class QueueSongCommand extends Command {
    constructor(youtubeService: YoutubeService) {
        super();
        this.youtubeService = youtubeService;
    }
    youtubeService: YoutubeService;

    name = "queue";
    description =
        "Queue a video from youtube, if no music plays starts playing it.";
    usage =
        " *required:* <Youtube link> *or search terms:* <term1> <term2> <term3> ...";
    hasArguments = true;
    type = CommandTypeEnum.MUSIC;
    async execute(
        message: Message,
        args: string[],
        elia: EliaInstance
    ): Promise<void> {
        if (
            elia.properties.modes.isRadio ||
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
                        this.queueFromYouTube(voiceChannel, message, elia, arg);
                    } else {
                        this.searchAndQueueFromYouTube(
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
     * Queue's a video or playlist from YouTube
     *
     * @param {VoiceChannel} voiceChannel the VoiceChannel to join
     * @param {Message} message the message which requested the music
     * @param {EliaInstance} elia the elia bot
     * @param {string} url a youtube video url
     */
    async queueFromYouTube(
        voiceChannel: VoiceChannel,
        message: Message,
        elia: EliaInstance,
        url: string
    ): Promise<void> {
        const id = this.youtubeService.getPlaylistIdFromUrl(url);
        if (id != null)
            elia.musicComponent?.playYouTubePlaylist(message, voiceChannel, id);
        else {
            const video = await this.youtubeService.getMusicFromUrl(url);
            if (video) {
                elia?.musicComponent?.queueMusic(message, voiceChannel, video);
            }
        }
    }

    /**
     * Searches a query in YouTube and then queue's the first video result match, if result exits
     *
     * @param {VoiceChannel} voiceChannel the VoiceChannel to join
     * @param {Message} message the message which requested the music
     * @param {string} query the search terms in one string
     * @param {EliaInstance} elia the elia bot
     */
    async searchAndQueueFromYouTube(
        voiceChannel: VoiceChannel,
        message: Message,
        query: string,
        elia: EliaInstance
    ): Promise<void> {
        const video = await this.youtubeService.getMusicFromQuery(query);
        if (video) {
            elia.musicComponent?.queueMusic(message, voiceChannel, video);
        } else {
            elia.messageComponent.reply(
                message,
                "No video results found.",
                elia.properties
            );
        }
    }
}
