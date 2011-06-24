var locked = require('./locked').locked;

/*  
	Loops every 'timeout' seconds and releases stale cells
*/
activityMonitor = function(timeout){
	this.timeout = timeout || 5;
	self = this;
	/*
		@api private
	*/
	var loop = function(){
		for(room in locked){
			if(room != "_events") // "_events" is inherited from events.EventEmitter
			for(cell in locked[room]){
				if(locked[room][cell].time.is_stale(self.timeout)) {
					// release this
					delete locked[room][cell];
					locked.emit('unlocked',{ room:room, cell:cell });
				}
			}
		}
		setTimeout(function(){ loop() },2000);
	}
	/*
		@api public
	*/
	this.start = function(){
			setTimeout(function(){ loop() },2000)
	}
}

module.exports.monitor = new activityMonitor();

/*
	Check if Date is older than timeout
*/
Date.prototype.is_stale = function(timeout){
	var now = new Date();
	if(((now - this) / 1000) >= timeout) return true;
	return false;
}