'use strict';

const bluebird = require('bluebird');

class rpsQueue {
	constructor(options) {
		this.Promise = options.PromiseLibrary || bluebird;
		this.requestsPerSecond = options.requestsPerSecond || Infinity;
		this.maxConcurrent = options.maxConcurrent || Infinity;
		this.maxQueued = options.maxQueued || Infinity;

		this.queue = [];
		this._numProcessed = 0;
		this._currentConcurrent = 0;

		this.setRequestsPerSecond();
	}

	add(callbackFunction) {
		return new this.Promise((resolve, reject) => {
			if (this.queue.length >= this.maxQueued) {
				reject(new Error('Exceeded max queue length'));
				return;
			}
			this.queue.push({
				callbackFunction,
				resolve,
				reject
			});
		});
	}

	getQueueLength() {
		return this.queue.length;
	}

	getNumProcessed() {
		return this._numProcessed;
	}

	getNumConcurrent() {
		return this._currentConcurrent;
	}

	setRequestsPerSecond(requestsPerSecond) {
		clearInterval(this._timer);
		this.requestsPerSecond = requestsPerSecond || this.requestsPerSecond;
		const intervalRate = 1000 / this.requestsPerSecond;
		this._timer = setInterval(this._dequeue.bind(this), intervalRate);
	}

	_updateStateDequeue() {
		this._currentConcurrent--;
		this._numProcessed++;
	}

	_dequeue() {
		if (this._currentConcurrent >= this.maxConcurrent || this.queue.length === 0) {
			return;
		}
		this._currentConcurrent++;

		const item = this.queue.shift();
		this.Promise.resolve(item.callbackFunction())
			.then((res) => {
				this._updateStateDequeue();
				item.resolve(res);
			})
			.catch((err) => {
				this._updateStateDequeue();
				item.reject(err);
			});
	}
}

module.exports = rpsQueue;
