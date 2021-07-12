import DataSource from "../../config.json";

/**
 * Component for handling the data in the config.json file.
 */
export default class DataComponent {

    /**
     * Get's the message display time
     *
     * @returns {number} the display time in milliseconds
     */
    getMessageDisplayTime(): number {
        return parseInt(DataSource.messageDisplayTime);
    }

    /**
     * Get's the bots mode
     *
     * @returns {boolean} true if the bot is in development mode, else false
     */
    getDevMode(): boolean {
        return DataSource.devMode;
    }

    /**
     * Get's the bots radio mode
     *
     * @returns {boolean} true if the bot is in radio mode, else false
     */
    getRadioMode(): boolean {
        return DataSource.radioMode;
    }

    /**
     * Get's the radio channel for a specific server
     *
     * @param {string} serverId the server's id
     * @returns {?string} the radio channel's id if exists else undefined
     */
    getRadioChannel(serverId: string): string | undefined {
        return DataSource.servers.find((e) => e.id == serverId)?.radioChannelID;
    }

    /**
     * Get's the bots prefix
     *
     * @returns {string} the prefix
     */
    getPrefix(): string {
        return DataSource.prefix;
    }

    /**
     * Get's the default music volume for a specific server
     *
     * @param {?string} serverId the server's id
     * @returns {string} the server volume
     */
    getMusicVolume(serverId: string | undefined): string {
        if (!serverId && serverId == undefined)
            return DataSource.defaultMusicVolume;
        else {
            const volume = DataSource.servers.find((e) => e.id == serverId)?.musicVolume;
            if (volume) {
                return volume;
            } else {
                return DataSource.defaultMusicVolume;
            }
        }
    }

    /**
     * Get's the bot spam channel id for a specific server
     *
     * @param {string} serverId the server's id
     * @returns {string} the channel's id
     */
    getBotSpamChannelId(serverId: string): string | undefined {
        return DataSource.servers.find((e) => e.id == serverId)?.botSpamChannelID;
    }

    /**
     * Get's the meme channel id for a specific server
     *
     * @param {string} serverId the server's id
     * @returns {?string} the channel's id if exists else undefined
     */
    getMemeChannelId(serverId: string): string | undefined {
        return DataSource.servers.find((e) => e.id == serverId)?.memeTextChannelID;
    }

    /**
     * Get's the pin channel id for a specific server
     *
     * @param {string} serverId the server's id
     * @returns {?string} the channel's id if exists else undefined
     */
    getPinChannelId(serverId: string): string | undefined {
        return DataSource.servers.find((e) => e.id == serverId)?.pinTextChannelID;
    }

    /**
     * Gets the current version of ELIA
     *
     * @returns {string} the current version of ELIA
     */
    getVersion(): string {
        return DataSource.version;
    }
}
