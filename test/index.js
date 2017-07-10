'use strict';
const assert = require('assert');
const Promise = require('bluebird');

describe('rpsQueue', () => {
	let Queue;
	beforeEach(() => {
		Queue = require('../src');
	});

	it('promise generator can return non-promise', () => {
		const queue = new Queue();
		return queue
			.add(() => {
				return true;
			})
			.then((result) => {
				assert.equal(result, true);
			});
	});

	it('promise generator can return promise', () => {
		const queue = new Queue();
		return queue
			.add(() => {
				return Promise.resolve(true);
			})
			.then((result) => {
				assert.equal(result, true);
			});
	});

	it('rejects with error if limit of max queued promises reached', () => {
		const queue = new Queue({
			maxQueued: 0
		});
		return queue
			.add(() => {
				return true;
			})
			.then(() => {
				throw new Error('It should be rejected');
			}, (err) => {
				assert.equal(err.message, 'Exceeded max queue length');
			});
	});

	it('passes along rejects back to caller', () => {
		const queue = new Queue();
		return queue
			.add(() => {
				return Promise.reject('Promise generator is rejecting.');
			})
			.then(() => {
				throw new Error('It should be rejected');
			}, (err) => {
				assert.equal(err, 'Promise generator is rejecting.');
			});
	});

	it('queue is started on initialization', () => {
		const queue = new Queue();
		assert.equal(queue.isStarted, true);
	});

	it('queue isStarted reports false when stopped', () => {
		const queue = new Queue();
		queue.stop();
		assert.equal(queue.isStarted, false);
	});

	it('queue length reports number of items in the queue', () => {
		const queue = new Queue();
		queue.stop();
		queue.add(() => {});
		queue.add(() => {});
		queue.add(() => {});
		assert.equal(queue.getQueueLength(), 3);
	});

	it('queue getNumProcessed returns how many promises have been processed regardless of success', () => {
		const queue = new Queue();
		return queue
			.add(() => {
				return Promise.resolve(true);
			})
			.then(() => {
				assert.equal(queue.getNumProcessed(), 1);
				return queue.add(() => {
					return Promise.reject(false);
				});
			})
			.then(() => {
				throw new Error('It should be rejected');
			},
			() => {
				assert.equal(queue.getNumProcessed(), 2);
			});
	});

	it('can update rate, does not affect isStarted state', () => {
		const queue = new Queue();
		assert.equal(Infinity, queue.requestsPerSecond);
		assert.equal(true, queue.isStarted);
		queue.requestsPerSecond = 20;
		assert.equal(20, queue.requestsPerSecond);
		assert.equal(true, queue.isStarted);

		queue.stop();

		assert.equal(20, queue.requestsPerSecond);
		assert.equal(false, queue.isStarted);
		queue.requestsPerSecond = 30;
		assert.equal(30, queue.requestsPerSecond);
		assert.equal(false, queue.isStarted);
	});

	it('gets number of concurrent promises', () => {
		const queue = new Queue();
		queue.add(() => {
			return Promise.delay(500);
		});
		queue.add(() => {
			return Promise.delay(500);
		});
		return Promise.delay(100)
			.then(() => {
				assert.equal(2, queue.getNumConcurrent());
			});
	});
});
