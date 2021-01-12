const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "delete",
    description: "deletes messages",
    usage: " *required:* <number of messages before this command>",
    type: CommandTypeEnum.UTILITY,
    async execute(message, args, _bot) {
        if (message.channel.type === "dm") {
            message.reply("You can't use this command in DM's");
            return;
        }

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
        if (!deleteCount || deleteCount < 1 || deleteCount > 99)
            return message.reply(
                "Please provide a number between 1 and 99 for the number of messages to delete"
            );

        // So we get our messages, and delete them. Simple enough, right?
        message.channel.bulkDelete(deleteCount + 1, true).catch((error) => {
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
