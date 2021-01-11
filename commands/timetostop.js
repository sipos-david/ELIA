module.exports = {
    name: 'timetostop',
    description: 'plays time to stop soundeffect',
    args: false,
    usage: '',
    guildOnly: true,
    async execute(msg, args) {
        if (msg.member.voice.channel) {
            // Only try to join the sender's voice channel if they are in one themselves
            msg.delete();
            let connection = await msg.member.voice.channel.join();
            const dispatcher = connection.play(
                './resources/soundeffects/its_time_to_stop.mp3',
                {
                    volume: 0.4,
                }
            );
            dispatcher.on('finish', () => {
                console.log(msg.author.username + ' played: time to stop');
                dispatcher.destroy();
                connection.disconnect();
            });
        } else {
            msg.reply('You need to join a voice channel first!');
        }
    },
};
