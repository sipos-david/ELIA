import { createAudioResource } from "@discordjs/voice";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";
import fs from "fs";
import LoggingComponent from "../../components/core/LoggingComponent";
import EliaInstance from "../../EliaInstance";
import CommandCallSource from "../../model/CommandCallSource";
import { SlashCommandBuilder } from "@discordjs/builders";

/**
 * Command for playing sound effects
 */
export default class SoundEffectCommand extends Command {
    /**
     * @param {string} name the command's name
     */
    constructor(name: string) {
        super();
        this.name = name;
        this.description = "Plays " + this.name + " soundeffect";
    }
    usage = "";
    type = CommandTypeEnum.SOUNDEFFECT;

    async execute(
        source: CommandCallSource,
        _args: string[],
        elia: EliaInstance
    ): Promise<void> {
        if (elia.musicComponent?.messageSenderInVoiceChannel(source)) {
            // Only try to join the sender's voice channel if they are in one themselves
            if (source.member && source.member.voice.channel) {
                const voiceChannel = await elia.musicComponent?.getVoiceChannel(
                    source.member?.voice?.channel,
                    source
                );
                if (voiceChannel) {
                    const resource = createAudioResource(
                        `./src/res/soundeffects/${this.name}.mp3`
                    );

                    elia.audioComponent.playSoundEffect(
                        resource,
                        voiceChannel,
                        () => {
                            elia.loggingComponent.log(
                                source.user.username + " played: " + this.name
                            );
                        }
                    );
                }
            }
        }
    }

    createSlashCommandData(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
        // eslint-disable-next-line indent
    > {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}

/**
 * Generate sound effects commands from sound effect folder.
 * The filename before .mp3 becomes the name of the command.
 *
 * @param {LoggingComponent} loggingComponent the logging componenet to log added sound effects.
 * @returns {Command[]} the list of sound effect commands
 */
export function getSoundEffectCommands(
    loggingComponent: LoggingComponent
): Command[] {
    const commands: Command[] = [];
    //import sound effects
    loggingComponent.log("Generating soundeffect commands:");
    const soundEffects = fs
        .readdirSync("./src/res/soundeffects")
        .filter((file: string) => file.endsWith(".mp3"));

    for (const soundEffect of soundEffects) {
        const newSoundEffectCommand = new SoundEffectCommand(
            soundEffect.replace(".mp3", "").toLowerCase()
        );
        commands.push(newSoundEffectCommand);
        loggingComponent.log(soundEffect + " -> " + newSoundEffectCommand.name);
    }
    return commands;
}
