import Command from "../commands/Command";

/**
 * Component for ELIA which adds basic commands
 */
export default class CommandComponent {
    commands: Map<string, Command> = new Map();

    addCommands(_commands: Command[]): void {
        _commands.forEach((cmd) => this.commands.set(cmd.name, cmd));
    }
}
