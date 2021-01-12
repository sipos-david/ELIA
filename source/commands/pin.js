const { pinChannelID } = require("../../config.json");

module.exports = {
    name: "pin",
    description: "send messages to pin channel",
    args: true,
    usage: " <message>",
    guildOnly: false,
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
