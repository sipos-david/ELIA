//basic command imports
const DeleteMessagesCommand = require("../../commands/text/DeleteMessagesCommand");
const HelpCommand = require("../../commands/text/HelpCommand");
const MemeCommand = require("../../commands/text/MemeCommand");
const PinCommand = require("../../commands/text/PinCommand");
const PingCommand = require("../../commands/text/PingCommand");
const PollCommand = require("../../commands/text/PollCommand");

class CommandComponent {
    /**
     * Adds the basic commands to the object in the parameter.
     *
     * @param {*} commandMap a JS Map object
     * @param {*} loggingComponent the loggingComponent for ELIA
     */
    constructor(commandMap, loggingComponent) {
        // import generic commands
        let commands = [
            new DeleteMessagesCommand(),
            new HelpCommand(),
            new MemeCommand(),
            new PinCommand(),
            new PingCommand(),
            new PollCommand(),
        ];

        commands.forEach((cmd) => commandMap.set(cmd.name, cmd));

        loggingComponent.log("Basic commands added to Elia.");
    }
}

module.exports = CommandComponent;
