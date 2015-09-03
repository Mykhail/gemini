'use strict';

var Flat = require('./flat'),
    inherit = require('inherit');

module.exports = inherit(Flat, {
    _formatStateInfo: function(result) {
        return this._compile('<%= base %> <%= chalk.blue(sessionId) %>', {
            base: this.__base(result),
            sessionId: result.sessionId
        });
    }
});
