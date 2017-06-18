'use strict';

const bluebird = require('bluebird');

/* eslint valid-jsdoc: ["error", { "requireReturn": false }] */
/**
 * The rpsQueue class attempts to process functionCalls from a queue at a fixed rate. The class ensures a maximum concurrency and a maximum number of items queued.
 *
 * @property {number} requestsPerSecond - The target rate for processing function calls. The actual rate may be less than this value. Note the rate can be changed on the fly while the processor is running.
 */
class rpsQueue {

	/**
	 * Creates a new queue with the specified configuration.
	 *
	 * @param {object} options - Configuration options for the queue.
	 * @param {object} [options.PromiseLibrary=bluebird] - The Promise library you are using.
	 * @param {number} [options.requestsPerSecond=Infinity] - The requests per second you wish to process.
	 * @param {number} [options.maxConcurrent=Infinity] - The maximum number of items in the queue processed at any given time.
	 * @param {number} [options.maxQueued=Infinity] - The maximum queue length.
	 */
	constructor(options) {
		this.Promise = options.PromiseLibrary || bluebird;
		this.requestsPerSecond = options.requestsPerSecond || Infinity;
		this.maxConcurrent = options.maxConcurrent || Infinity;
		this.maxQueued = options.maxQueued || Infinity;

		this.queue = [];
		this._numProcessed = 0;
		this._currentConcurrent = 0;
	}

	/**
	 * Adds a function call to the end of the queue to be processed.
	 *
	 * @param {object} callbackFunction - A function call to be added to the queue to be processed at a later time.
	 * @returns {promise} Fulfills when the function call has been completed.
	 */
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

	/**
	* @returns {number} Number of function calls in the queue.
	*/
	getQueueLength() {
		return this.queue.length;
	}

	/**
	* @returns {number} Number of function calls that the queue has processed.
	*/
	getNumProcessed() {
		return this._numProcessed;
	}

	/**
	* @returns {number} Number of function calls currently in flight.
	*/
	getNumConcurrent() {
		return this._currentConcurrent;
	}

	set requestsPerSecond(requestsPerSecond) {
		clearInterval(this._timer);
		const intervalRate = 1000 / requestsPerSecond;
		this._requestsPerSecond = requestsPerSecond;
		this._timer = setInterval(this._dequeue.bind(this), intervalRate);
	}

	get requestsPerSecond() {
		return this._requestsPerSecond;
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
