import SoundEffectCommand from "../commands/voice/SoundEffectCommand";
import fs from "fs";
import LoggingComponent from "./core/LoggingComponent";
import Command from "../commands/Command";

/**
 * Component for ELIA which adds sound effect commands
 */
export default class SoundEffectComponent {
    static getSoundEffectCommands(
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
                soundEffect.replace(".mp3", "").toLowerCase(),
                undefined
            );
            commands.push(newSoundEffectCommand);
            loggingComponent.log(
                soundEffect + " -> " + newSoundEffectCommand.name
            );
        }
        return commands;
    }
}
