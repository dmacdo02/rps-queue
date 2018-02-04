'use strict';

const bluebird = require('bluebird');
const Deque = require('double-ended-queue');

/* eslint valid-jsdoc: ["error", { "requireReturn": false }] */
/**
 * The rpsQueue class attempts to process functionCalls from a queue at a fixed rate. The class ensures a maximum concurrency and a maximum number of items queued. The queue starts right away.
 *
 * @property {number} requestsPerSecond - The target rate for processing function calls. The actual rate may be less than this value. Note the rate can be changed on the fly while the processor is running.
 */
class rpsQueue {

	_numberOrInfinity(value) {
		if (!isNaN(value) && value !== null && value !== undefined) {
			return value;
		}
		return Infinity;
	}

	/**
	 * Creates a new queue with the specified configuration.
	 *
	 * @param {object} options - Configuration options for the queue.
	 * @param {object} [options.PromiseLibrary=bluebird] - The Promise library you are using.
	 * @param {number} [options.requestsPerSecond=Infinity] - The requests per second you wish to process.
	 * @param {number} [options.maxConcurrent=Infinity] - The maximum number of items in the queue processed at any given time.
	 * @param {number} [options.maxQueued=Infinity] - The maximum queue length.
	 * @param {boolean} [options.start=false] - Wether the queue should start running at instantion
	 */
	constructor(options) {
		options = options || {};
		this.Promise = options.PromiseLibrary || bluebird;
		this._requestsPerSecond = this._numberOrInfinity(options.requestsPerSecond);
		this.maxConcurrent = this._numberOrInfinity(options.maxConcurrent);
		this.maxQueued = this._numberOrInfinity(options.maxQueued);
		this.queue = new Deque();
		this._numProcessed = 0;
		this._currentConcurrent = 0;
		if (options.start)
			this.start();
		else
			this._isStarted = false;
	}

	/**
	* Starts processing the queue
	*/
	start() {
		const intervalRate = 1000 / this._requestsPerSecond;
		this._requestsPerSecond = this._requestsPerSecond;
		this._timer = setInterval(this._dequeue.bind(this), intervalRate);
		this._isStarted = true;
	}

	/**
	* Stops processing the queue
	*/
	stop() {
		clearInterval(this._timer);
		this._isStarted = false;
	}

	/**
	* @returns {boolean} Indicates if queue is processing.
	*/
	get isStarted() {
		return this._isStarted;
	}

	/**
	 * Adds a function call to the end of the queue to be processed.
	 * This function does not start the queue if it was stopped
	 *
	 * @param {object} callbackFunction - A function call to be added to the queue to be processed at a later time.
	 * @returns {promise} Fulfills when the function call has been completed.
	 */
	addNoStart(callbackFunction) {
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
	 * Adds a function call to the end of the queue to be processed.
	 * This starts the queue if it was not active
	 *
	 * @param {object} callbackFunction - A function call to be added to the queue to be processed at a later time.
	 * @returns {promise} Fulfills when the function call has been completed.
	 */
	add(callbackFunction) {
		var promise = this.addNoStart(callbackFunction);

		if (! this._isStarted)
			this.start();

		return promise;
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
		const wasStarted = this._isStarted;
		this.stop();
		this._requestsPerSecond = requestsPerSecond;
		if (wasStarted) {
			this.start();
		}
	}

	get requestsPerSecond() {
		return this._requestsPerSecond;
	}

	_updateStateDequeue() {
		this._currentConcurrent--;
		this._numProcessed++;
	}

	_dequeue() {
		// Prevent object from running when there is nothing in queue
		if (this.queue.length === 0){
			this.stop();
			return;
		}
		if (this._currentConcurrent >= this.maxConcurrent) {
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
