import {
    CacheType,
    Client,
    CommandInteraction,
    Guild,
    GuildMember,
    Message,
    MessagePayload,
    ReplyMessageOptions,
    TextBasedChannel,
    User,
} from "discord.js";
import MessageComponent from "../components/core/MessageComponent";

interface CommandCallSource {
    get channel(): TextBasedChannel | null | undefined;

    get user(): User;

    get member(): GuildMember | null;

    get guild(): Guild | null;

    get client(): Client | null;

    reply(
        options: string | MessagePayload | ReplyMessageOptions
    ): Promise<void | Message>;

    deleteWith(messageComponent: MessageComponent): void;
}

class InteractionCallSource implements CommandCallSource {
    constructor(public readonly interaction: CommandInteraction<CacheType>) {}

    get client(): Client | null {
        return this.interaction.client;
    }

    get guild(): Guild | null {
        return this.interaction.guild;
    }

    get member(): GuildMember | null {
        const member = this.interaction.member;
        if (member instanceof GuildMember) {
            return member;
        } else {
            return null;
        }
    }

    get channel(): TextBasedChannel | null | undefined {
        return this.interaction?.channel;
    }

    get user(): User {
        return this.interaction.user;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteWith(_messageComponent: MessageComponent): void {
        /* intentionally empty */
        return;
    }

    reply(
        options: string | MessagePayload | ReplyMessageOptions
    ): Promise<void | Message> {
        return this.interaction.reply(options);
    }
}

class MessageCallSource implements CommandCallSource {
    constructor(public readonly message: Message) {}

    get client(): Client | null {
        return this.message.client;
    }

    get guild(): Guild | null {
        return this.message.guild;
    }

    get member(): GuildMember | null {
        return this.message.member;
    }

    get channel(): TextBasedChannel | null | undefined {
        return this.message?.channel;
    }

    get user(): User {
        return this.message.author;
    }

    deleteWith(messageComponent: MessageComponent): void {
        messageComponent.deleteMsgNow(this.message);
    }

    reply(
        options: string | MessagePayload | ReplyMessageOptions
    ): Promise<void | Message> {
        return this.message.channel.send(options);
    }
}

export default CommandCallSource;
export { InteractionCallSource, MessageCallSource };
