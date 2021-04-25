const DataSource = require("../../../config.json");
/**
 * Component for handling the data in the config.json file.
 */
class DataComponent {
    /**
     * Get's the Discord token
     *
     * @returns {string} the token
     */
    getToken() {
        return DataSource.token;
    }

    /**
     * Get's the message display time
     *
     * @returns {number} the display time in millisecs
     */
    getMessageDisplayTime() {
        return parseInt(DataSource.messageDisplayTime);
    }

    /**
     * Get's the bot's preifx
     *
     * @returns {string} the prefix
     */
    getPrefix() {
        return DataSource.prefix;
    }

    /**
     * Get's the default music volume for a specific server
     *
     * @param {number} serverId the server's id
     * @returns {string} the server volume
     */
    getMusicVolume(serverId) {
        if (!serverId) return DataSource.defaultMusicVolume;
        else
            return DataSource.servers.find((e) => e.id == serverId).musicVolume;
    }

    /**
     * Get's the bot spam channel id for a specific server
     *
     * @param {number} serverId the server's id
     * @returns {string} the channel's id
     */
    getBotSpamChannelId(serverId) {
        return DataSource.servers.find((e) => e.id == serverId)
            .botSpamChannelID;
    }

    /**
     * Get's the meme channel id for a specific server
     *
     * @param {number} serverId the server's id
     * @returns {string} the channel's id
     */
    getMemeChannelId(serverId) {
        return DataSource.servers.find((e) => e.id == serverId)
            .memeTextChannelID;
    }

    /**
     * Get's the pin channel id for a specific server
     *
     * @param {number} serverId the server's id
     * @returns {string} the channel's id
     */
    getPinChannelId(serverId) {
        return DataSource.servers.find((e) => e.id == serverId)
            .pinTextChannelID;
    }
}

module.exports = DataComponent;
