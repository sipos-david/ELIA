class ActivityDisplayComponent {
    /**
     * Setups the ActivityDisplayComponent
     *
     * @param {*} bot a Discord bot client
     * @param {*} dataComponent a DataComponent for data
     */
    constructor(bot, dataComponent) {
        this.bot = bot;
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
