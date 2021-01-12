const { pinChannelID } = require("../../config.json");
const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "pin",
    description: "send messages to pin channel",
    usage: " <message>",
    type: CommandTypeEnum.OTHER,
    async execute(message, args, _bot) {
        const channelID = pinChannelID;
        const channel = await message.client.channels.fetch(channelID);
        if (channel) {
            let messageText = args.join(" ");
            channel.send(`${message.author.toString()} ` + messageText);
            message.delete();
            console.log(message.author.username + " pinned a message");
        }
    },
};
