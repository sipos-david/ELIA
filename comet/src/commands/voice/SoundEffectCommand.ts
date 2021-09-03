import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";
import { Message } from "discord.js";
import Elia from "../../Elia";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

/**
 * Command for playing sound effects
 */
export default class SoundEffectCommand extends Command {
    /**
     * @param {string} name the command's name
     * @param {?number} volume the volume of the played sound
     */
    constructor(name: string, volume: number | undefined) {
        super();
        this.name = name;

        this.description = "plays " + this.name + "soundeffect";

        if (volume !== undefined) this.soundEffectVolume = volume;
    }

    usage = " ";
    type = CommandTypeEnum.SOUNDEFFECT;
    /**
     * the volume of the played sound
     *
     * @type {number}
     */
    soundEffectVolume = 0.8;

    async execute(
        message: Message,
        _args: string[],
        elia: Elia
    ): Promise<void> {
        elia.messageComponent.deleteMsgNow(message);
        if (elia.musicComponent?.messageSenderInVoiceChannel(message)) {
            // Only try to join the sender's voice channel if they are in one themselves
            const voiceChannel = message.member?.voice.channel;
            if (voiceChannel) {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });
                const audioPlayer = createAudioPlayer();
                const resource = createAudioResource(
                    `./resources/soundeffects/${this.name}.mp3`
                );
                resource.volume?.setVolume(this.soundEffectVolume);

                audioPlayer.play(resource);
                connection.subscribe(audioPlayer);
                audioPlayer.on(AudioPlayerStatus.Idle, () => {
                    elia.loggingComponent.log(
                        message.author.username + " played: " + this.name
                    );
                    connection.destroy();
                });
            }
        } else {
            elia.messageComponent.reply(
                message,
                "You need to join a voice channel first!"
            );
        }
    }
}
