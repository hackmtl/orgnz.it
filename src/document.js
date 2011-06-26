var db = require('./db').proxy,
	utils = require('./utils').utils,
	config = require('./config');

doc = module.exports = function doc(id, callback){
	this.id = id || utils.rand();
	this.rows, this.cols;
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
				self.rows = self._rows();
				self.cols = self._cols();
				self.save(callback)
			}
		});
	},
		
	save: function(callback){
		db.save(this,callback);
	},
	
	_rows : function(){
		if(!this.rows){
			this.rows = [];
			for(var i = 0; i < config.default_rows ; i++){
				this.rows.unshift(new this._row(this));
			}
		}
		return this.rows;
	},
	
	_cols : function(){
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
