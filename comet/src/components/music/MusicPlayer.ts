import { Client, Message, VoiceChannel } from "discord.js";
import DataComponent from "../core/DataComponent";
import MessageComponent from "../core/MessageComponent";

/**
 * Class for handling Discord.js voice connections
 */
export default class MusicPlayer {
    constructor(
        dataComponent: DataComponent,
        bot: Client,
        messageComponent: MessageComponent
    ) {
        this.dataComponent = dataComponent;
        this.bot = bot;
        this.messageComponent = messageComponent;
    }

    /**
     *
     */
    private dataComponent: DataComponent;
    private bot: Client;
    private messageComponent: MessageComponent;

    /**
     * Get the voice channel from message, if config not available, falls back to function parameter
     *
     * @param {VoiceChannel} voiceChannel the voice channel the user is in
     * @param {Message} message the message that has the music command
     * @returns {?VoiceChannel} the new music voice channel
     */
    async getVoiceChannel(
        voiceChannel: VoiceChannel,
        message: Message
    ): Promise<VoiceChannel> {
        if (this.dataComponent.getRadioMode() && message.guild) {
            const radioChannel = this.dataComponent.getRadioChannel(
                message.guild.id
            );
            if (radioChannel) {
                const radioVoiceChannel =
                    this.bot.channels.cache.get(radioChannel);
                if (radioVoiceChannel) {
                    if (radioVoiceChannel instanceof VoiceChannel) {
                        return radioVoiceChannel;
                    }
                } else {
                    this.messageComponent.reply(
                        message,
                        "Radio channel not available for current server!"
                    );
                }
            }
            return voiceChannel;
        } else {
            return voiceChannel;
        }
    }
}
