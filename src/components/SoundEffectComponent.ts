import SoundEffectCommand from "../commands/voice/SoundEffectCommand";
import fs from "fs";
import Elia from "../Elia";
import LateInitComponent from "./LateInitComponent";

/**
 * Component for ELIA which adds sound effect commands
 */
export default class SoundEffectComponent extends LateInitComponent {
    /**
     * Adds the sound effect commands to the ELIA object in the parameter.
     *
     * @param {Elia} elia an ELIA object
     */
    init(elia: Elia): void {
        //import sound effects
        elia.loggingComponent.log("Generating soundeffect commands:");

        const soundEffects = fs
            .readdirSync("./resources/soundeffects")
            .filter((file) => file.endsWith(".mp3"));

        for (const soundEffect of soundEffects) {
            const newSoundEffectCommand = new SoundEffectCommand(
                soundEffect.replace(".mp3", "").toLowerCase(),
                undefined
            );
            elia.commandMap.set(
                newSoundEffectCommand.name,
                newSoundEffectCommand
            );
            elia.loggingComponent.log(
                soundEffect + " -> " + newSoundEffectCommand.name
            );
        }
        elia.loggingComponent.log("Sound effect commands added to Elia.");
    }
}
