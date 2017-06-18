# rps-queue [![NPM version](https://badge.fury.io/js/rps-queue.svg)](https://npmjs.org/package/rps-queue)

> A queue that will dequeue (call a provided function) at a given rate and has a max number concurrent (active functions running)

## Installation

```sh
$ npm install --save rps-queue
```

## Usage

For a full API reference, see [API.md](https://github.com/dmacdo02/rps-queue/blob/master/API.md).

```js
'use strict';
const Promise = require('bluebird');
const RpsQueue = require('rps-queue');
let rpsQueue = new RpsQueue({
	requestsPerSecond: 2,
	maxConcurrent: 2
});

function logMetrics() {
	console.log('NumProcessed:', rpsQueue.getNumProcessed());
	console.log('QueueLength:', rpsQueue.getQueueLength());
	console.log('NumConcurrent:', rpsQueue.getNumConcurrent());
	console.log('--------------');
}

rpsQueue.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('Done number 1');
	});
}).then(() => logMetrics());
rpsQueue.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('Done number 2');
	});
}).then(() => logMetrics());
rpsQueue.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('Done number 3');
	});
}).then(() => logMetrics());
rpsQueue.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('Done number 4');
	});
}).then(() => logMetrics());

```

## License

ISC © [Derek MacDonald]()
