const SoundEffectCommand = require("../commands/voice/SoundEffectCommand");
const fs = require("fs");
const Elia = require("../Elia");

/**
 * Component for ELIA which adds sound effect commands
 */
class SoundEffectComponent {
    /**
     * Adds the sound effect commands to the ELIA object in the parameter.
     *
     * @param {Elia} elia an ELIA object
     */
    init(elia) {
        //import sound effects
        elia.loggingComponent.log("Generating soundeffect commands:");

        const soundEffects = fs
            .readdirSync("./resources/soundeffects")
            .filter((file) => file.endsWith(".mp3"));

        for (const soundEffect of soundEffects) {
            const newSoundEffectCommand = new SoundEffectCommand(
                soundEffect.replace(".mp3", "").toLowerCase()
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

module.exports = SoundEffectComponent;
