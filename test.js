'use strict';
const Promise = require('bluebird');
const RpsQueue = require('./src');
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
