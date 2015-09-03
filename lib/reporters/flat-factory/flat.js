'use strict';

var inherit = require('inherit'),
    _ = require('lodash'),
    chalk = require('chalk'),

    RunnerEvents = require('../../constants/runner-events');

module.exports = inherit({
    attachRunner: function(runner) {
        runner.on(RunnerEvents.BEGIN, this._onBegin.bind(this));
        runner.on(RunnerEvents.END_TEST, this._onEndTest.bind(this));
        runner.on(RunnerEvents.CAPTURE, this._onCapture.bind(this));
        runner.on(RunnerEvents.ERROR, this._onError.bind(this));
        runner.on(RunnerEvents.WARNING, this._onWarning.bind(this));
        runner.on(RunnerEvents.END, this._onEnd.bind(this));
    },

    _onBegin: function() {
        this._failed = 0;
        this._passed = 0;
        this._skipped = 0;
    },

    _onEndTest: function(result) {
        if (result.equal) {
            this._logSuccess(result);
            this._passed++;
        } else {
            this._logFail(result);
            this._failed++;
        }
    },

    _onCapture: function(result) {
        this._logSuccess(result);
        this._passed++;
    },

    _onError: function(errorResult) {
        this._logFail(errorResult);
        this._failed++;
    },

    _onWarning: function(errorResult) {
        this._logWarning(errorResult);
        this._skipped++;
    },

    _onEnd: function() {
        var total = this._failed + this._passed + this._skipped;

        console.log('Total: %s Passed: %s Failed: %s Skipped: %s',
            chalk.underline(total),
            chalk.green(this._passed),
            chalk.red(this._failed),
            chalk.cyan(this._skipped)
        );
    },

    _logSuccess: function(result) {
        this._log('success', result);
    },

    _logFail: function(result) {
        this._log('fail', result);

        var e = result.originalError || result;
        console.error(e.stack || e.message);
    },

    _logWarning: function(result) {
        this._log('warning', result);
        console.warn(result.message);
    },

    _log: function(type, result) {
        var data = this._getTemplateData(result),
            template = _.template(this._getTemplate()[type], {
                imports: {chalk: chalk}
            });

        console.log(template(data));
    },

    _getTemplate: function() {
        return {
            success: '<%= chalk.green("\u2713") %> <%= statePath %> <%= chalk.underline(stateName) %> [<%= chalk.yellow(browserId) %>]',
            fail: '<%= chalk.red("\u2718") %> <%= statePath %> <%= chalk.underline(stateName) %> [<%= chalk.yellow(browserId) %>]',
            warning: '<%= chalk.bold.yellow("!") %> <%= statePath %> <%= chalk.underline(stateName) %> [<%= chalk.yellow(browserId) %>]'
        };
    },

    _getTemplateData: function(stateResult) {
        return {
            browserId: stateResult.browserId,
            stateName: stateResult.state.name,
            statePath: stateResult.suite.path.join(' ')
        };
    }
});
