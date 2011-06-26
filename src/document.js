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
				//console.log(data.rows[0].cells);
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
		console.log('hmm')
		db.update(this,callback);
	},
	
	_rows : function(){
		if(!this.rows){
			this.rows = [];
			for(var i = 0; i < config.default_rows ; i++){
				this.rows.unshift(new this._row(null,this));
			}
		}
		return this.rows;
	},
	
	_cols : function(){
		if(!this.cols){
			this.cols = [];
			for(var i = 0; i < config.default_cols ; i++){
				this.cols.unshift(new this._col(null,this));
			}
		}
		return this.cols;
	},
	
	_col : function(id,self){
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
	
	_row : function(id,self){
		that = this;
		row = {};
		if(id){
			for(var row in self.rows){
				if(self.id === id){
					return row;
				}
			}
			return null;
		}
		row.id = utils.rand();
		row.cells = [];
		for(var i = 0; i < config.default_cols ; i++) {
			row.cells.unshift(new self._cell(null,self));
		}
		return row;
	},

	update_cell: function(id,val){
		for(var i = 0; i < this.rows.length; i++){
			var row = this.rows[i];
			for(var j = 0; j < row.cells.length; j++){
				var a_cell = row.cells[j];
				if(a_cell.id === id){
					a_cell.value = val;
					this.save(function(){
						return;
					});
				}
			}
		}
	},
	
	_cell : function(id){
		that = this;
		cell = {}
		if(id){
			cell.id = id;
			for(var i = 0; i < this.rows.length; i++){
				var row = this.rows[i];
				for(var j = 0; j < row.cells.length; j++){
					var a_cell = row.cells[j];
					if(a_cell.id === id){
						return a_cell;
					}
				}
			}
			return null;
		}
		cell.id = utils.rand();
		cell.value = "test";
		return cell;
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
