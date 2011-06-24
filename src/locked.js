var events = require('events');

var ev = new events.EventEmitter();

/* locked object inherits from event.EventEmitter so we can listen to changes */
locked = function(){ return ev; }

module.exports.locked = new locked();
