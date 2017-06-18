'use strict';
const Promise = require('bluebird');
const RpsQ = require('./src');
let rpsQ = new RpsQ({
	requestsPerSecond: 0.5,
	maxConcurrent: 2
});

rpsQ.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('did number 1');
	});
}).then(() => {
	console.log(rpsQ.getNumProcessed());
	console.log(rpsQ.getQueueLength());
	console.log(rpsQ.getNumConcurrent());
});
rpsQ.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('did number 2');
	});
}).then(() => {
	console.log(rpsQ.getNumProcessed());
	console.log(rpsQ.getQueueLength());
	console.log(rpsQ.getNumConcurrent());
});
rpsQ.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('did number 3');
	});
}).then(() => {
	console.log(rpsQ.getNumProcessed());
	console.log(rpsQ.getQueueLength());
	console.log(rpsQ.getNumConcurrent());
});
rpsQ.add(() => {
	return Promise.delay(3000).then(() => {
		console.log('did number 4');
	});
}).then(() => {
	console.log(rpsQ.getNumProcessed());
	console.log(rpsQ.getQueueLength());
	console.log(rpsQ.getNumConcurrent());
});
