const { prefix } = require("../../config.json");

module.exports = function setDefaultActivity(bot) {
    bot.user.setActivity("your commands! Use " + prefix + "help", {
        type: "LISTENING",
    });
};
