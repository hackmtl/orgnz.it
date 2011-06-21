var dataProxy = require('./dataProxy').proxy,
	utils = require('./utils').utils;

var doc = module.exports = function doc(id){
	this.id = id || utils.rand(),
	this.data = this.data();
};

doc.prototype = {
	data: function(){
		return dataProxy.get(this.id);
	},
	
	update : function(){
	}
}
