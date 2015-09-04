'use strict';

var assert = require('chai').assert,
    sinon = require('sinon'),
    EventEmitter = require('events').EventEmitter,
    FlatReporter = require('../../../../lib/reporters/flat-factory/flat'),
    RunnerEvents = require('../../../../lib/constants/runner-events'),
    logger = require('../../../../lib/utils').logger,
    chalk = require('chalk'),
    _ = require('lodash');

describe('Reporter#Flat', function() {
    var sandbox = sinon.sandbox.create(),
        test = {
            suite: {path: ['block', 'size', 'big']},
            state: {name: 'hover'},
            browserId: 'chrome'
        },
        ee;

    function getCounters(args) {
        args = _.last(args);
        return {
            total: chalk.stripColor(args[1]),
            passed: chalk.stripColor(args[2]),
            failed: chalk.stripColor(args[3]),
            skipped: chalk.stripColor(args[4])
        };
    }

    beforeEach(function() {
        var reporter = new FlatReporter();

        ee = new EventEmitter();
        reporter.attachRunner(ee);
        sandbox.stub(logger);
    });

    afterEach(function() {
        sandbox.restore();
        ee.removeAllListeners();
    });

    it('should initialize counters with 0', function() {
        ee.emit(RunnerEvents.BEGIN);
        ee.emit(RunnerEvents.END);

        var counters = getCounters(logger.log.args);

        assert.equal(counters.total, 0);
        assert.equal(counters.passed, 0);
        assert.equal(counters.failed, 0);
        assert.equal(counters.skipped, 0);
    });

    describe('should correctly calculate counters for', function() {
        it('successed', function() {
            ee.emit(RunnerEvents.BEGIN);
            ee.emit(RunnerEvents.CAPTURE, test);
            ee.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.total, 1);
            assert.equal(counters.passed, 1);
            assert.equal(counters.failed, 0);
            assert.equal(counters.skipped, 0);
        });

        it('failed', function() {
            ee.emit(RunnerEvents.BEGIN);
            ee.emit(RunnerEvents.ERROR, test);
            ee.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.total, 1);
            assert.equal(counters.passed, 0);
            assert.equal(counters.failed, 1);
            assert.equal(counters.skipped, 0);
        });

        it('skipped', function() {
            ee.emit(RunnerEvents.BEGIN);
            ee.emit(RunnerEvents.WARNING, test);
            ee.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.total, 1);
            assert.equal(counters.passed, 0);
            assert.equal(counters.failed, 0);
            assert.equal(counters.skipped, 1);
        });
    });

    describe('should correctly choose a handler if `equal` is', function() {
        it('true', function() {
            test.equal = true;

            ee.emit(RunnerEvents.BEGIN);
            ee.emit(RunnerEvents.END_TEST, test);
            ee.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.passed, 1);
            assert.equal(counters.failed, 0);
        });
        it('false', function() {
            test.equal = false;

            ee.emit(RunnerEvents.BEGIN);
            ee.emit(RunnerEvents.END_TEST, test);
            ee.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.passed, 0);
            assert.equal(counters.failed, 1);
        });
    });

    it('should correctly do the rendering', function() {
        ee.emit(RunnerEvents.BEGIN);
        ee.emit(RunnerEvents.CAPTURE, test);
        ee.emit(RunnerEvents.END);

        var deserealizedResult = chalk
            .stripColor(logger.log.args[0][0])
            .substr(2); // remove first symbol (icon)

        assert.equal(deserealizedResult, 'block size big hover [chrome]');
    });
});
