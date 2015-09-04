'use strict';

var assert = require('chai').assert,
    sinon = require('sinon'),
    EventEmitter = require('events').EventEmitter,
    FlatVerboseReporter = require('../../../../lib/reporters/flat-factory/flat-verbose'),
    RunnerEvents = require('../../../../lib/constants/runner-events'),
    logger = require('../../../../lib/utils').logger,
    chalk = require('chalk');

describe('Reporter#FlatVerbose', function() {
    var sandbox = sinon.sandbox.create(),
        test = {
            suite: {path: ['block', 'size', 'big']},
            state: {name: 'hover'},
            browserId: 'chrome',
            sessionId: '0fc23des'
        },
        ee;

    beforeEach(function() {
        var reporter = new FlatVerboseReporter();

        ee = new EventEmitter();
        reporter.attachRunner(ee);
        sandbox.stub(logger);
    });

    afterEach(function() {
        sandbox.restore();
        ee.removeAllListeners();
    });

    it('should correctly do the rendering', function() {
        ee.emit(RunnerEvents.BEGIN);
        ee.emit(RunnerEvents.CAPTURE, test);
        ee.emit(RunnerEvents.END);

        var deserealizedResult = chalk
            .stripColor(logger.log.args[0][0])
            .substr(2); // remove first symbol (icon)

        assert.equal(deserealizedResult, 'block size big hover [chrome: 0fc23des]');
    });
});
