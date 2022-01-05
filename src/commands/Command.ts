import { Message } from "discord.js";
import EliaInstance from "../EliaInstance";
import { CommandTypeEnum } from "./CommandTypeEnum";

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
     * @param {Message} message the Discord message object
     * @param {string[]} args the arguments for the commands
     * @param {EliaInstance} elia the EliaInstance object
     */
    abstract execute(
        message: Message,
        args: string[],
        eliaInstance: EliaInstance
    ): void;
}
