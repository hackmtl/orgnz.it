var dataProxy = require('./dataProxy').proxy,
	utils = require('./utils').utils;

var doc = module.exports = function doc(id, callback){
	this.id = id || utils.rand()
	this.data(callback);
};

doc.prototype = {
	data: function(callback){
		that = this;
		dataProxy.get(this.id, function(data){
			that.data = data;
			callback();
		});
	},
	
	update : function(){
	}
}
