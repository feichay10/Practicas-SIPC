const util = require('./util');

module.exports = {
    createProductReminder(locale, message) {
        return util.createReminder(locale, message);
    }
}