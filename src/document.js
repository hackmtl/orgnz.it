var mongoose = require('mongoose')

var doc = module.exports = function doc(id){
	this.id = id;
	this.properties = {}
	this.table = {}
	// get data from db
};

doc.prototype = {
	update : function(){},
	rows = function(){},
	row = function(id){},
	cols = function(){},
	col = function(id){},
	cell = function(id){}
}
