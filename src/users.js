var db = require('./db').proxy,
	utils = require('./utils').utils,
	config = require('./config');

users = module.exports = function users(callback){
	this.data(function(){
		callback();
	});
}

/*
	Model
*/
doc.prototype = {
	
	data: function(callback){
		self = this;
		db.get(this.id, function(data){
			if(data){
				self.cols = data.cols;
				self.rows = data.rows;
				callback();
			}
			else{
				self.cols = self._cols();
				self.rows = self._rows();
				self.save(callback)
			}
		});
	},
		
	save: function(callback){
		db.save(this,callback);
	},
	
	update: function(callback){
		db.update(this,callback);
	}

	
}
