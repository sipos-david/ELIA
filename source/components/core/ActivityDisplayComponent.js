const { Client } = require("discord.js");
const DataComponent = require("./DataComponent");

/**
 * Component which handles the Discord bot's displayed activity
 */
class ActivityDisplayComponent {
    /**
     * Setups the ActivityDisplayComponent
     *
     * @param {Client} bot a Discord bot client
     * @param {DataComponent} dataComponent a DataComponent for data
     */
    constructor(bot, dataComponent) {
        /**
         * The Discord Client
         * @type {Client}
         */
        this.bot = bot;
        /**
         * The component for data
         * @type {DataComponent}
         */
        this.dataComponent = dataComponent;
    }

    setMusicPlaying() {
        this.bot.user.setActivity("Music ♫", {
            type: "STREAMING",
        });
    }

    setDefault() {
        this.bot.user.setActivity(this.dataComponent.getPrefix() + "help", {
            type: "LISTENING",
        });
    }
}

module.exports = ActivityDisplayComponent;
