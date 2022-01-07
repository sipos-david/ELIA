import EliaInstance from "../EliaInstance";
import CommandCallSource from "../model/CommandCallSource";
import { CommandTypeEnum } from "./CommandTypeEnum";
import { SlashCommandBuilder } from "@discordjs/builders";
export default abstract class Command {
    /**
     * The name of the command, this comes after the prefix
     *
     * @type {string}
     */
    name = "";

    /**
     * The description of the command
     *
     * @type {string}
     */
    description = "";

    /**
     * The usage of the command
     *
     * @type {string}
     */
    usage = "";

    /**
     * The type of the command
     *
     * @type {CommandTypeEnum}
     */
    type: CommandTypeEnum = CommandTypeEnum.DEFAULT;

    /**
     * Determines if the command can or cannot be used in DMs, default is true
     *
     * @type {boolean}
     */
    guildOnly = true;

    /**
     * Determines if the command needs additional arguments, default is false
     *
     * @type {boolean}
     */
    hasArguments = false;

    /**
     * Determines if the message that triggered the command should be deleteded,
     * default is true.
     *
     * @type {boolean}
     */
    shouldDelete = true;

    /**
     * Execute the command
     *
     * @param {CommandCallSource} source the source of the command call
     * @param {string[]} args the arguments for the commands
     * @param {EliaInstance} elia the EliaInstance object
     */
    abstract execute(
        source: CommandCallSource,
        args: string[],
        eliaInstance: EliaInstance
    ): void;

    abstract createSlashCommandData(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
    >;
}
