interface GuildProperties {
    /**
     * The bots prefix for messages in the guild
     */
    prefix: string;

    /**
     * Music volume for a specific guild
     */
    musicVolume: number;

    /**
     * message display time in milliseconds
     */
    messageDisplayTime: number;

    modes: {
        /**
         * True if the bot is in development mode, else false
         */
        isDev: boolean;

        /**
         * True if the bot is in radio mode, else false
         */
        isRadio: boolean;
    };

    channels: {
        /**
         * Radio channel's id if exists else undefined
         */
        radioId: string | undefined;

        /**
         * Spam channel id for a specific guild
         */
        botSpamId: string | undefined;

        /**
         * Meme channel id for a specific guild
         */
        memeId: string | undefined;

        /**
         * Pin channel id for a specific guild
         */
        pinId: string | undefined;
    };
}

interface FlatGuildProperties {
    id: string;
    prefix: string | undefined;
    devMode: boolean | undefined;
    radioMode: boolean | undefined;
    musicVolume: string | undefined;
    messageDisplayTime: string | undefined;
    pinTextChannelID: string | undefined;
    memeTextChannelID: string | undefined;
    musicControlTextChannelID: string | undefined;
    botSpamChannelID: string | undefined;
    radioChannelID: string | undefined;
}

export default GuildProperties;
export { FlatGuildProperties };
