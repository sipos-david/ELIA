module.exports = {
    name: "delete",
    description: "deletes messages",
    args: true,
    usage: " <number of messages>",
    guildOnly: false,
    async execute(message, args, _bot) {
        // This command removes all messages from all users in the channel, up to 100.

        if (message.member) {
            if (!message.member.hasPermission("MANAGE_MESSAGES")) {
                message.reply(
                    "You don't have the permissions for deleting messages!"
                );
                return;
            }
        }

        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);

        // Ooooh nice, combined conditions. <3
        if (!deleteCount || deleteCount < 2 || deleteCount > 100)
            return message.reply(
                "Please provide a number between 2 and 100 for the number of messages to delete"
            );

        // So we get our messages, and delete them. Simple enough, right?
        message.channel.bulkDelete(deleteCount, true).catch((error) => {
            console.error(error);
            message.channel.send(
                "there was an error trying to delete messages in this channel!"
            );
        });
        console.log(
            message.author.username + " deleted " + deleteCount + " messages"
        );
    },
};
