import { Client } from "discord.js";
import DataComponent from "./DataComponent";

/**
 * Component which handles the Discord bots displayed activity
 */
export default class ActivityDisplayComponent {
    /**
     * Setups the ActivityDisplayComponent
     *
     * @param {Client} bot a Discord bot client
     * @param {DataComponent} dataComponent a DataComponent for data
     */
    constructor(bot: Client, dataComponent: DataComponent) {
        this.bot = bot;
        this.dataComponent = dataComponent;
    }
    /**
     * The Discord Client
     *
     * @type {Client}
     */
    bot: Client;
    /**
     * The component for data
     *
     * @type {DataComponent}
     */
    dataComponent: DataComponent;

    setMusicPlaying(): void {
        if (this.bot.user) {
            this.bot.user.setActivity("Music ♫", {
                type: "STREAMING",
            });
        }
    }

    setDefault(): void {
        if (this.bot.user) {
            this.bot.user.setActivity(this.dataComponent.getPrefix() + "help", {
                type: "LISTENING",
            });
        }
    }
}
