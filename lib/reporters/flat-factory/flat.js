'use strict';

var inherit = require('inherit'),
    _ = require('lodash'),
    chalk = require('chalk'),

    RunnerEvents = require('../../constants/runner-events'),

    ICON_SUCCESS = chalk.green('\u2713'),
    ICON_FAIL = chalk.red('\u2718'),
    ICON_WARN = chalk.bold.yellow('!');

module.exports = inherit({
    attachRunner: function(runner) {
        runner.on(RunnerEvents.BEGIN, this._onBegin.bind(this));
        runner.on(RunnerEvents.END_TEST, this._onEndTest.bind(this));
        runner.on(RunnerEvents.CAPTURE, this._onCapture.bind(this));
        runner.on(RunnerEvents.ERROR, this._onError.bind(this));
        runner.on(RunnerEvents.WARNING, this._onWarning.bind(this));
        runner.on(RunnerEvents.END, this._onEnd.bind(this));
    },

    _compile: function(tmpl, data) {
        return _.template(tmpl, {
            imports: {
                chalk: chalk
            }
        })(data);
    },

    _onBegin: function() {
        this._failed = 0;
        this._passed = 0;
        this._skipped = 0;
    },

    _onEndTest: function(result) {
        var event = result.equal ? this._onCapture : this._onError;
        event.call(this, result);
    },

    _onCapture: function(result) {
        console.log(ICON_SUCCESS + this._formatStateInfo(result));
        this._passed++;
    },

    _onError: function(result) {
        console.log(ICON_FAIL + this._formatStateInfo(result));

        var e = result.originalError || result;
        console.error(e.stack || e.message);

        this._failed++;
    },

    _onWarning: function(result) {
        console.log(ICON_WARN + this._formatStateInfo(result));
        console.warn(result.message);

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

    _formatStateInfo: function(result) {
        var tmpl = ' <%= state %> <%= chalk.underline(name) %> [<%= chalk.yellow(id) %>]';

        return this._compile(tmpl, {
            state: result.suite.path.join(' '),
            name: result.state.name,
            id: result.browserId
        });
    }
});
