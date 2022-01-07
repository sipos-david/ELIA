import { VoiceChannel } from "discord.js";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import isValidURL from "../../../lib/UrlChecker.js";
import YoutubeService from "../../../services/YoutubeService";
import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";

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
        source: CommandCallSource,
        args: string[],
        elia: EliaInstance
    ): Promise<void> {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(source) &&
                elia.musicComponent.messageSenderHasRightPermissions(source))
        ) {
            if (source.member && source.member.voice.channel) {
                const voiceChannel = await elia.musicComponent?.getVoiceChannel(
                    source.member.voice.channel,
                    source
                );
                if (voiceChannel) {
                    const arg = args[0];
                    if (arg && isValidURL(arg)) {
                        this.queueFromYouTube(voiceChannel, source, elia, arg);
                    } else {
                        this.searchAndQueueFromYouTube(
                            voiceChannel,
                            source,
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
     * @param {CommandCallSource} source the message which requested the music
     * @param {EliaInstance} elia the elia bot
     * @param {string} url a youtube video url
     */
    async queueFromYouTube(
        voiceChannel: VoiceChannel,
        source: CommandCallSource,
        elia: EliaInstance,
        url: string
    ): Promise<void> {
        const id = this.youtubeService.getPlaylistIdFromUrl(url);
        if (id != null)
            elia.musicComponent?.playYouTubePlaylist(source, voiceChannel, id);
        else {
            const video = await this.youtubeService.getMusicFromUrl(url);
            if (video) {
                elia?.musicComponent?.queueMusic(source, voiceChannel, video);
            }
        }
    }

    /**
     * Searches a query in YouTube and then queue's the first video result match, if result exits
     *
     * @param {VoiceChannel} voiceChannel the VoiceChannel to join
     * @param {CommandCallSource} source the message which requested the music
     * @param {string} query the search terms in one string
     * @param {EliaInstance} elia the elia bot
     */
    async searchAndQueueFromYouTube(
        voiceChannel: VoiceChannel,
        source: CommandCallSource,
        query: string,
        elia: EliaInstance
    ): Promise<void> {
        const video = await this.youtubeService.getMusicFromQuery(query);
        if (video) {
            elia.musicComponent?.queueMusic(source, voiceChannel, video);
        } else {
            elia.messageComponent.reply(source, "No video results found.");
        }
    }
}
