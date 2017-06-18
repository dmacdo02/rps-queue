<a name="rpsQueue"></a>

## rpsQueue
The rpsQueue class attempts to process functionCalls from a queue at a fixed rate. The class ensures a maximum concurrency and a maximum number of items queued.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| requestsPerSecond | <code>number</code> | The target rate for processing messages. The actual rate may be less than this value. Note the rate can be changed on the fly while the processor is running. |


* [rpsQueue](#rpsQueue)
    * [new rpsQueue(options)](#new_rpsQueue_new)
    * [.add(callbackFunction)](#rpsQueue+add) ⇒ <code>promise</code>
    * [.getQueueLength()](#rpsQueue+getQueueLength) ⇒ <code>number</code>
    * [.getNumProcessed()](#rpsQueue+getNumProcessed) ⇒ <code>number</code>
    * [.getNumConcurrent()](#rpsQueue+getNumConcurrent) ⇒ <code>number</code>

<a name="new_rpsQueue_new"></a>

### new rpsQueue(options)
Creates a new queue with the specified configuration.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | Configuration options for the queue. |
| [options.PromiseLibrary] | <code>object</code> | <code>bluebird</code> | The Promise library you are using. |
| [options.requestsPerSecond] | <code>number</code> | <code>Infinity</code> | The requests per second you wish to process. |
| [options.maxConcurrent] | <code>number</code> | <code>Infinity</code> | The maximum number of items in the queue processed at any given time. |
| [options.maxQueued] | <code>number</code> | <code>Infinity</code> | The maximum queue length. |

<a name="rpsQueue+add"></a>

### rpsQueue.add(callbackFunction) ⇒ <code>promise</code>
Adds a function call to the end of the queue to be processed.

**Kind**: instance method of [<code>rpsQueue</code>](#rpsQueue)  
**Returns**: <code>promise</code> - Fulfills when the function call has been completed.  

| Param | Type | Description |
| --- | --- | --- |
| callbackFunction | <code>object</code> | A function call to be added to the queue to be processed at a later time. |

<a name="rpsQueue+getQueueLength"></a>

### rpsQueue.getQueueLength() ⇒ <code>number</code>
**Kind**: instance method of [<code>rpsQueue</code>](#rpsQueue)  
**Returns**: <code>number</code> - Number of function calls in the queue.  
<a name="rpsQueue+getNumProcessed"></a>

### rpsQueue.getNumProcessed() ⇒ <code>number</code>
**Kind**: instance method of [<code>rpsQueue</code>](#rpsQueue)  
**Returns**: <code>number</code> - Number of function calls that the queue has processed.  
<a name="rpsQueue+getNumConcurrent"></a>

### rpsQueue.getNumConcurrent() ⇒ <code>number</code>
**Kind**: instance method of [<code>rpsQueue</code>](#rpsQueue)  
**Returns**: <code>number</code> - Number of function calls currently in flight.  
