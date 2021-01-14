const { prefix } = require("../../config.json");

class ActivityDisplay {
    constructor(bot) {
        this._bot = bot;
    }

    setMusicPlaying() {
        this._bot.user.setActivity("Music ♫", {
            type: "STREAMING",
        });
    }

    setDefault() {
        this._bot.user.setActivity(prefix + "help", {
            type: "LISTENING",
        });
    }
}

module.exports = ActivityDisplay;
