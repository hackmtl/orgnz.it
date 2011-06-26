var db = require('./db').proxy,
	utils = require('./utils').utils,
	config = require('./config');

var doc = module.exports = function doc(id, callback){
	var columns,
		rows;
	this.id = id || utils.rand();
	self = this;
	
	this.get_data(function(){
		callback();
	});
}

/*
	Model
*/

doc.prototype = {
	
	get_data: function(callback){
		self = this;
		db.get(this.id, function(data){
			if(data){
				self.cols = data.cols;
				self.rows = data.rows;
				callback();
			}
			else{
				self.rows = self.get_rows();
				self.cols = self.get_cols();
				self.save(callback)
			}
		});
	},
	
	update : function(){
		/* db / cache saving */
	},
	
	save: function(callback){
		db.save(this,callback);
	},
	
	get_rows : function(){
		if(!this.rows){
			this.rows = [];
			for(var i = 0; i < config.default_rows ; i++){
				console.log(this._row);
				this.rows.unshift(new this._row(this));
			}
		}
		return this.rows;
	},
	
	get_cols : function(){
		if(!this.cols){
			this.cols = [];
			for(var i = 0; i < config.default_cols ; i++){
				this.cols.unshift(new this._col(this));
			}
		}
		return this.cols;
	},
	
	_col : function(self,id){
		if(id){
			for(var i = 0; i < self.cols.length; i++){
				var a_col = self.cols[i];
				if(a_col.id === id){
					return a_col;
				}
			}
			return null;
		}
		return {
			id : utils.rand(),
			type : 'string' ,
			name : 'Col name' ,
			options : {} ,
			width : 'auto' 
		}
	},
	
	_row : function(self,id){
		row = {};
		if(id){
			for(var row in self.rows){
				if(self.id === id) return row
			}
			return null;
		}
		row.id = utils.rand();
		row.cells = [];
		for(var i = 0; i < config.default_cols ; i++) {
			row.cells.unshift(new self._cell(self));
		}
		return row;
	},
	
	_cell : function(self,id){
		if(id){
			for(var i = 0; i < self.rows.length; i++){
				var row = self.rows[i];
				for(var j = 0; j < row.cells.length; j++){
					var cell = row.cells[j];
					if(cell.id === id){
						return cell;
					}
				}
			}
			return null;
		}
		return { id:utils.rand(), value: 'test'};
	},
	
	add_row : function(){
		self = this;
		this.after = function(id){
			for(var i = 0; i < self.rows.length; i++){
				if(self.rows[i].id === id){ 
					self.rows.splice(i+1, 0, new self._row());
					break;
				}
			}
		}
		this.before = function(id){
			for(var i = 0; i < self.rows.length; i++){
				if(self.rows[i].id === id){
					if(i != 0) self.rows.splice(i, 0, new self._row());
					else self.rows.unshift(new self._row());
					break;
				}
			}
		}
		return this;
	},
	
	add_column : function(options){
		self = this;
	},
	
	remove_row : function(id){},
	
	remove_column : function(id){}
}

/*var default_doc = function(){
	var id = utils.rand();
	var cols = [
		{ 
			id: 'col1',
			type: 'string',
			name: 'column 1',
			options: {},
			width: 'auto'
		 },
		{
			id: 'col2',
			type: 'string',
			name: 'column 2',
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
}*/
