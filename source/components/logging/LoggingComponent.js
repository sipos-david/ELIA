/**
 * Component for handling the log's.
 */
class LoggingComponent {
    /**
     *  Logs the message.
     *
     * @param {*} message the message
     */
    log(message) {
        console.log(message);
    }

    /**
     * Logs the error.
     *
     * @param {*} error the error
     */
    error(error) {
        console.error(error);
    }
}

module.exports = LoggingComponent;
