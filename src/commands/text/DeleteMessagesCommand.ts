import EliaInstance from "../../EliaInstance";
import CommandCallSource from "../../model/CommandCallSource";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class DeleteMessagesCommand extends Command {
    name = "delete";
    description = "Deletes messages";
    usage = "*required:* <number of messages before this command>";
    type = CommandTypeEnum.UTILITY;
    shouldDelete = false;

    execute(
        source: CommandCallSource,
        args: string[],
        elia: EliaInstance
    ): void {
        if (source.channel?.type === "DM")
            return elia.messageComponent.reply(
                source,
                "You can't use this command in DMs"
            );

        if (source.member) {
            if (!source.member.permissions.has("MANAGE_MESSAGES")) {
                return elia.messageComponent.reply(
                    source,
                    "You don't have the permissions for deleting messages!"
                );
            }
        }

        if (args[0]) {
            // get the delete count, as an actual number.
            const deleteCount = parseInt(args[0], 10);

            if (!deleteCount || deleteCount < 1 || deleteCount > 99)
                return elia.messageComponent.reply(
                    source,
                    "Please provide a number between 1 and 99 for the number of messages to delete"
                );

            // Delete messages
            source.channel
                ?.bulkDelete(deleteCount + 1, true)
                .catch((error: unknown) => {
                    elia.loggingComponent.error(error);
                    elia.messageComponent.reply(
                        source,
                        "there was an error trying to delete messages in this channel!"
                    );
                });
            elia.loggingComponent.log(
                source.user.username + " deleted " + deleteCount + " messages"
            );
        }
    }

    createSlashCommandData(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
        // eslint-disable-next-line indent
    > {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption((option) =>
                option
                    .setName("number")
                    .setDescription("Number of messages before this command")
                    .setRequired(true)
            );
    }
}
