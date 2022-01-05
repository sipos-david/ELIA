import { Client } from "discord.js";
import config from "./../../config.json";

/**
 * Component which handles the Discord bots displayed activity
 */
export default class ActivityDisplayComponent {
    /**
     * Setups the ActivityDisplayComponent
     *
     * @param {Client} bot a Discord bot client
     */
    constructor(private readonly bot: Client) {}

    setMusicPlaying(): void {
        if (this.bot.user) {
            this.bot.user.setActivity("Music ♫", {
                type: "STREAMING",
            });
        }
    }

    setDefault(): void {
        if (this.bot.user) {
            this.bot.user.setActivity(config.defaults.prefix + "help", {
                type: "LISTENING",
            });
        }
    }
}
