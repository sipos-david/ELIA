module.exports = {
    name: "ping",
    description: "Pings the bot",
    args: false,
    usage: "",
    guildOnly: false,
    execute(message, _args, _bot) {
        message.reply("Pong!");
    },
};
