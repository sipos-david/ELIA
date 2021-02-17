const DataSource = require("../../../config.json");
/**
 * Component for handling the data in the config.json file.
 */
class DataComponent {
    getToken() {
        return DataSource.token;
    }

    getPrefix() {
        return DataSource.prefix;
    }

    getMusicVolume(serverId) {
        if (!serverId) return DataSource.defaultMusicVolume;
        else
            return DataSource.servers.find((e) => e.id == serverId).musicVolume;
    }

    getBotSpamChannelId(serverId) {
        return DataSource.servers.find((e) => e.id == serverId)
            .botSpamChannelID;
    }

    getMemeChannelId(serverId) {
        return DataSource.servers.find((e) => e.id == serverId)
            .memeTextChannelID;
    }

    getPinChannelId(serverId) {
        return DataSource.servers.find((e) => e.id == serverId)
            .pinTextChannelID;
    }
}

module.exports = DataComponent;
