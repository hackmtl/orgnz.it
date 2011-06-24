var dataProxy = require('./dataProxy').proxy,
	utils = require('./utils').utils;

var doc = module.exports = function doc(id, callback){
	this.id = id || utils.rand();
	this.data = {};
	this.get_data(callback);
};

doc.prototype = {
	get_data: function(callback){
		that = this;
		dataProxy.get(this.id, function(data){
			if(data){
				that.data = data;
				callback();
			}
			else{ // document doesn't exist
				that.data = new default_doc();
				that.save(callback);
			}
		});
	},
	
	update : function(){
	},
	
	save: function(callback){
		dataProxy.save(this, callback);
	}
}

var default_doc = function(){
	var id = utils.rand();
	var cols = [
		{ 
			id: 'col1',
			type: 'string',
			options: {},
			width: 'auto'
		 },
		{
			id: 'col2',
			type: 'string',
			options: {},
			width: 'auto'
		}
	];
	var rows = [
		{
			id: 'row1',
			cells: [
				{
					id: 'row1_col1',
					value: 'foo'
				},
				{
					id: 'row1_col2',
					value: 'bar'
				}
			]
		}
		,
		{
			id: 'row2',
			cells: [
				{
					id: 'row2_col1',
					value: 'bar'
				},
				{
					id: 'row2_col2',
					value: 'foo'
				}
			]
		}
	];
	return {
		id: id,
		cols: cols,
		rows: rows
	}
}
