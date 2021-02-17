/**
 * Enum for the command types
 */
const CommandTypeEnum = Object.freeze({
    DEFAULT: 0,
    /**
     * Enum for music commands
     */
    MUSIC: 1,
    /**
     * Enum for soundeffect commands
     */
    SOUNDEFFECT: 2,
    /**
     * Enum for utility commands
     */
    UTILITY: 3,
    OTHER: 4,
});

module.exports = CommandTypeEnum;
