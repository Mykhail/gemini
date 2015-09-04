'use strict';

exports.requireWithNoCache = function(moduleName) {
    var result = require(moduleName);
    delete require.cache[moduleName];
    return result;
};

exports.logger = {
    log: function() {
        console.log.apply(console, arguments);
    },
    warn: function() {
        console.warn.apply(console, arguments);
    },
    error: function() {
        console.error.apply(console, arguments);
    }
};
