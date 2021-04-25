const { Message } = require("discord.js");
const Elia = require("../Elia");
const CommandTypeEnum = require("./CommandTypeEnum");

class Command {
    /**
     * The name of the command, this commes after the prefix
     * @type {string}
     */
    name = "";

    /**
     * The description of the command
     * @type {string}
     */
    description = "";

    /**
     * The usage of the command
     * @type {string}
     */
    usage = "";

    /**
     * The type of the command
     * @type {CommandTypeEnum}
     */
    type = CommandTypeEnum.DEFAULT;

    /**
     * Determines if the command can or cannot be used in DM's, default is true
     * @type {boolean}
     */
    guildOnly = true;

    /**
     * Determines if the command needs aditional arguments, default is false
     * @type {boolean}
     */
    hasArguments = false;

    /**
     * Determines if the the message.delete() funcition should be called after the execute function.
     * Default is yes.
     * @type {boolean}
     */
    shouldDelete = true;

    /**
     * Execute the command
     *
     * @param {Message} message the Discord message object
     * @param {String[]} args the arguments for the commands
     * @param {Elia} elia the Elia object
     */
    async execute(message, args, elia) {
        // default command, this does nothing.
    }
}

module.exports = Command;
