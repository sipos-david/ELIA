const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "ping",
    description: "Pings the bot",
    usage: " ",
    type: CommandTypeEnum.OTHER,
    execute(message, _args, _bot) {
        message.reply("Pong!");
    },
};
