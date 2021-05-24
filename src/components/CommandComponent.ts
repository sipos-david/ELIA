//basic command imports
import DeleteMessagesCommand from "../commands/text/DeleteMessagesCommand";
import HelpCommand from "../commands/text/HelpCommand";
import MemeCommand from "../commands/text/MemeCommand";
import PinCommand from "../commands/text/PinCommand";
import PingCommand from "../commands/text/PingCommand";
import PollCommand from "../commands/text/PollCommand";
import Elia from "../Elia";
import LateInitComponent from "./LateInitComponent";

/**
 * Component for ELIA which adds basic commands
 */
export default class CommandComponent extends LateInitComponent{
    /**
     * Adds the basic commands to the object in the parameter.
     *
     * @param {Elia} elia an ELIA object
     */
    init(elia: Elia): void {
        // import generic commands
        const commands = [
            new DeleteMessagesCommand(),
            new HelpCommand(),
            new MemeCommand(),
            new PinCommand(),
            new PingCommand(),
            new PollCommand(),
        ];

        commands.forEach((cmd) => elia.commandMap.set(cmd.name, cmd));
        elia.loggingComponent.log("Basic commands added to Elia.");
    }
}
