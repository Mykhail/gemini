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
            suite: {path: []},
            state: {name: 'test'},
            browserId: 0
        },
        emitter;

    function getCounters(args) {
        args = _.last(args);
        return {
            total: chalk.stripColor(args[1]),
            passed: chalk.stripColor(args[2]),
            failed: chalk.stripColor(args[3]),
            skipped: chalk.stripColor(args[4])
        };
    }

    function extendTest(props) {
        return _.extend({}, test, props);
    }

    beforeEach(function() {
        var reporter = new FlatReporter();

        emitter = new EventEmitter();
        reporter.attachRunner(emitter);
        sandbox.stub(logger);
    });

    afterEach(function() {
        sandbox.restore();
        emitter.removeAllListeners();
    });

    it('should initialize counters with 0', function() {
        emitter.emit(RunnerEvents.BEGIN);
        emitter.emit(RunnerEvents.END);

        var counters = getCounters(logger.log.args);

        assert.equal(counters.total, 0);
        assert.equal(counters.passed, 0);
        assert.equal(counters.failed, 0);
        assert.equal(counters.skipped, 0);
    });

    describe('should correctly calculate counters for', function() {
        it('successed', function() {
            emitter.emit(RunnerEvents.BEGIN);
            emitter.emit(RunnerEvents.CAPTURE, test);
            emitter.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.total, 1);
            assert.equal(counters.passed, 1);
            assert.equal(counters.failed, 0);
            assert.equal(counters.skipped, 0);
        });

        it('failed', function() {
            emitter.emit(RunnerEvents.BEGIN);
            emitter.emit(RunnerEvents.ERROR, test);
            emitter.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.total, 1);
            assert.equal(counters.passed, 0);
            assert.equal(counters.failed, 1);
            assert.equal(counters.skipped, 0);
        });

        it('skipped', function() {
            emitter.emit(RunnerEvents.BEGIN);
            emitter.emit(RunnerEvents.WARNING, test);
            emitter.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.total, 1);
            assert.equal(counters.passed, 0);
            assert.equal(counters.failed, 0);
            assert.equal(counters.skipped, 1);
        });
    });

    describe('should correctly choose a handler if `equal` is', function() {
        it('true', function() {
            var test = extendTest({
                equal: true
            });

            emitter.emit(RunnerEvents.BEGIN);
            emitter.emit(RunnerEvents.END_TEST, test);
            emitter.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.passed, 1);
            assert.equal(counters.failed, 0);
        });
        it('false', function() {
            var test = extendTest({
                equal: false
            });

            emitter.emit(RunnerEvents.BEGIN);
            emitter.emit(RunnerEvents.END_TEST, test);
            emitter.emit(RunnerEvents.END);

            var counters = getCounters(logger.log.args);

            assert.equal(counters.passed, 0);
            assert.equal(counters.failed, 1);
        });
    });


    describe('should print a error if it there is in', function() {
        it('result', function() {
            var test = extendTest({
                message: 'Error from result'
            });

            emitter.emit(RunnerEvents.BEGIN);
            emitter.emit(RunnerEvents.ERROR, test);
            emitter.emit(RunnerEvents.END);

            assert.equal(logger.error.args[0][0], test.message);
        });

        it('originalError', function() {
            var test = extendTest({
                originalError: {message: 'Error from originalError'}
            });

            emitter.emit(RunnerEvents.BEGIN);
            emitter.emit(RunnerEvents.ERROR, test);
            emitter.emit(RunnerEvents.END);

            assert.equal(logger.error.args[0][0], test.originalError.message);
        });

    });

    it('should correctly do the rendering', function() {
        var test = extendTest({
            suite: {path: ['block', 'size', 'big']},
            state: {name: 'hover'},
            browserId: 'chrome'
        });

        emitter.emit(RunnerEvents.BEGIN);
        emitter.emit(RunnerEvents.CAPTURE, test);
        emitter.emit(RunnerEvents.END);

        var deserealizedResult = chalk
            .stripColor(logger.log.args[0][0])
            .substr(2); // remove first symbol (icon)

        assert.equal(deserealizedResult, 'block size big hover [chrome]');
    });
});
