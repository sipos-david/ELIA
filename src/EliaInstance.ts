import { Client } from "discord.js";
import AudioComponent from "./components/AudioComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import MusicComponent from "./components/music/MusicComponent";
import GuildProperties from "./model/GuildProperties";

export default class EliaInstance {
    constructor(
        // Shared
        public bot: Client,
        public messageComponent: MessageComponent,
        public loggingComponent: LoggingComponent,
        // Instanced
        public properties: GuildProperties,
        public musicComponent: MusicComponent,
        public audioComponent: AudioComponent
    ) {}
}
