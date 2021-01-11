module.exports = {
    name: 'ping',
    description: 'Pings the bot',
    args: false,
    usage: '',
    guildOnly: false,
    execute(message, args) {
        message.reply('Pong!');
    },
};
