'use strict';

var Flat = require('./flat'),
    inherit = require('inherit'),
    _ = require('lodash');

module.exports = inherit(Flat, {
    _getTemplate: function() {
        var baseTemplates = this.__base();

        return _.mapValues(baseTemplates, function(template) {
            return template + ' <%= chalk.blue(sessionId) %>';
        });
    },

    _getTemplateData: function(stateResult) {
        var data = this.__base(stateResult);

        return _.extend(data, {
            sessionId: stateResult.sessionId
        });
    }
});
