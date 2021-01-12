const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "meme",
    description: "send memes to specific channel",
    args: true,
    usage: " <link>",
    type: CommandTypeEnum.OTHER,
    async execute(message, args, _bot) {
        // zen szerveren memes channel
        const channelID = "703131306476699648";
        const channel = await message.client.channels.fetch(channelID);
        if (channel) {
            let messageText = args.join(" ");
            channel.send(`${message.author.toString()} ` + messageText);
            message.delete();
            console.log(message.author.username + " sent memes");
        }
    },
};
