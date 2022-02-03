import { Client } from "discord.js";
import AudioComponent from "./components/audio/AudioComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import MusicComponent from "./components/audio/MusicComponent";
import GuildProperties from "./model/GuildProperties";

export default class EliaInstance {
    constructor(
        // Shared
        public bot: Client,
        public loggingComponent: LoggingComponent,
        // Instanced
        public properties: GuildProperties,
        public messageComponent: MessageComponent,
        public musicComponent: MusicComponent,
        public audioComponent: AudioComponent
    ) {}
}
