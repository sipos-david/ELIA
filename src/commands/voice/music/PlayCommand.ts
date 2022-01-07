import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import isValidURL from "../../../lib/UrlChecker";
import { VoiceChannel } from "discord.js";
import YoutubeService from "../../../services/YoutubeService";
import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class PlayCommand extends Command {
    constructor(youtubeService: YoutubeService) {
        super();
        this.youtubeService = youtubeService;
    }
    youtubeService: YoutubeService;

    name = "play";
    description = "Joins and plays a video from YouTube";
    usage =
        "*required:* <YouTube link> or search terms: <term1> <term2> <term3> ...";
    type = CommandTypeEnum.MUSIC;
    hasArguments = true;

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
                        this.playFromYouTube(voiceChannel, source, elia, arg);
                    } else {
                        this.searchAndPlayFromYouTube(
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
     * Play's a video or playlist from YouTube
     *
     * @param {VoiceChannel} voiceChannel the VoiceChannel to join
     * @param {CommandCallSource} source the message which requested the music
     * @param {EliaInstance} elia the elia bot
     * @param {string} url a youtube video url
     */
    async playFromYouTube(
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
                elia?.musicComponent?.startPlayingMusic(
                    source,
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
     * @param {CommandCallSource} source the message which requested the music
     * @param {string} query the search terms in one string
     * @param {EliaInstance} elia the elia bot
     */
    async searchAndPlayFromYouTube(
        voiceChannel: VoiceChannel,
        source: CommandCallSource,
        query: string,
        elia: EliaInstance
    ): Promise<void> {
        const video = await this.youtubeService.getMusicFromQuery(query);
        if (video) {
            elia.musicComponent?.startPlayingMusic(source, voiceChannel, video);
        } else {
            elia.messageComponent.reply(source, "No video results found.");
        }
    }

    createSlashCommandData(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
        // eslint-disable-next-line indent
    > {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription(
                        "<YouTube link> or search terms: <term1> <term2> <term3> ..."
                    )
                    .setRequired(true)
            );
    }
}
