import { Message } from "discord.js";
import EliaInstance from "../../EliaInstance";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

export default class DeleteMessagesCommand extends Command {
    name = "delete";
    description = "deletes messages";
    usage = " *required:* <number of messages before this command>";
    type = CommandTypeEnum.UTILITY;
    shouldDelete = false;

    execute(message: Message, args: string[], elia: EliaInstance): void {
        if (message.channel.type === "DM")
            return elia.messageComponent.reply(
                message,
                "You can't use this command in DMs",
                elia.properties
            );

        if (message.member) {
            if (!message.member.permissions.has("MANAGE_MESSAGES")) {
                return elia.messageComponent.reply(
                    message,
                    "You don't have the permissions for deleting messages!",
                    elia.properties
                );
            }
        }

        if (args[0]) {
            // get the delete count, as an actual number.
            const deleteCount = parseInt(args[0], 10);

            if (!deleteCount || deleteCount < 1 || deleteCount > 99)
                return elia.messageComponent.reply(
                    message,
                    "Please provide a number between 1 and 99 for the number of messages to delete",
                    elia.properties
                );

            // Delete messages
            message.channel
                .bulkDelete(deleteCount + 1, true)
                .catch((error: any) => {
                    elia.loggingComponent.error(error);
                    elia.messageComponent.reply(
                        message,
                        "there was an error trying to delete messages in this channel!",
                        elia.properties
                    );
                });
            elia.loggingComponent.log(
                message.author.username +
                    " deleted " +
                    deleteCount +
                    " messages"
            );
        }
    }
}
