const SoundEffectCommand = require("../../commands/voice/soundeffects/SoundEffectCommand");
const fs = require("fs");

class SoundEffectComponent {
    /**
     * Adds the sound effect commands to the object in the parameter.
     *
     * @param {*} commandMap a JS Map object
     * @param {*} loggingComponent a loggingComponent object
     */
    constructor(commandMap, loggingComponent) {
        //import sound effects
        loggingComponent.log("Generating soundeffect commands:");

        const soundEffects = fs
            .readdirSync("./resources/soundeffects")
            .filter((file) => file.endsWith(".mp3"));

        for (const soundEffect of soundEffects) {
            const newSoundEffectCommand = new SoundEffectCommand(
                soundEffect.replace(".mp3", "").toLowerCase()
            );
            commandMap.set(newSoundEffectCommand.name, newSoundEffectCommand);
            loggingComponent.log(
                "\t" + soundEffect + " -> " + newSoundEffectCommand.name
            );
        }
        loggingComponent.log("Sound effect commands added to Elia.");
    }
}

module.exports = SoundEffectComponent;
