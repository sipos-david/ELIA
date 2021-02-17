const Command = require("../Command");
const CommandTypeEnum = require("../CommandTypeEnum");

class PingCommand extends Command {
    name = "ping";
    description = "Pings the bot";
    usage = " ";
    type = CommandTypeEnum.OTHER;
    async execute(message, _args, elia) {
        elia.messageComponent.reply(message, "Pong!");
    }
}

module.exports = PingCommand;
