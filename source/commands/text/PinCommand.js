const Command = require("../Command");
const CommandTypeEnum = require("../CommandTypeEnum");

class PinCommand extends Command {
    name = "pin";
    description = "send messages to the server's pin channel";
    usage = " <message>";
    hasArguments = true;
    type = CommandTypeEnum.OTHER;
    shouldDelete = false;
    async execute(message, args, elia) {
        const channelID = elia.dataComponent.getPinChannelId(message.guild.id);
        const channel = await message.client.channels.fetch(channelID);
        if (channel) {
            let messageText = args.join(" ");
            channel.send(`${message.author.toString()} ` + messageText);
            message.delete();

            elia.loggingComponent.log(
                message.author.username + " pinned a message"
            );
        }
    }
}

module.exports = PinCommand;
