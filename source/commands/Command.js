const CommandTypeEnum = require("./CommandTypeEnum");

class Command {
    /**
     * The name of the command, this commes after the prefix
     */
    name = "";

    /**
     * The description of the command
     */
    description = "";

    /**
     * The usage of the command
     */
    usage = "";

    /**
     * The type of the command
     */
    type = CommandTypeEnum.DEFAULT;

    /**
     * Determines if the command can or cannot be used in DM's, default is true
     */
    guildOnly = true;

    /**
     * Determines if the command needs aditional arguments, default is false
     */
    hasArguments = false;

    /**
     * Executing the command
     *
     * @param {*} message the Discord message object
     * @param {*} args the arguments for the commands
     * @param {*} elia the Elia object
     */
    async execute(message, args, elia) {
        // default command, this does nothing.
    }
}

module.exports = Command;
