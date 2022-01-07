/**
 * Component for handling the log's.
 */
export default class LoggingComponent {
    /**
     *  Logs the message.
     *
     * @param {string} message the message
     */
    log(message: string): void {
        console.log(message);
    }

    /**
     * Logs the error.
     *
     * @param {*} error the error
     */
    error(error: unknown): void {
        console.error(error);
    }
}
