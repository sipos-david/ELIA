const Command = require("../Command");
const CommandTypeEnum = require("../CommandTypeEnum");

class MemeCommand extends Command {
    name = "meme";
    description = "send memes to the server's specific meme channel";
    hasArguments = true;
    usage = " <link>";
    type = CommandTypeEnum.OTHER;
    shouldDelete = false;
    async execute(message, args, elia) {
        const channelID = elia.dataComponent.getMemeChannelId(message.guild.id);
        const channel = await message.client.channels.fetch(channelID);
        if (channel) {
            let messageText = args.join(" ");
            channel.send(`${message.author.toString()} ` + messageText);
            message.delete();

            elia.loggingComponent.log.log(
                message.author.username + " sent memes"
            );
        }
    }
}

module.exports = MemeCommand;
