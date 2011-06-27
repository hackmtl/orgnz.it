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
			name : '' ,
			options : {} ,
			width : 'auto'
		}
	},
	
	insert_col : function(callback){
		new_col = new this._col();
		this.cols.push(new_col);
		new_cells = [];
		
		for(var i = 0; i < this.rows.length; i++){
			var row = this.rows[i],
				new_cell = new this._cell();
			row.cells.push(new_cell);
			new_cells.unshift(new_cell);
		}
		
		this.update(function(){
			callback(new_col, new_cells);
		});
	},
	
	update_col : function(id, data){
		for(var i = 0; i < this.cols.length; i++){
			var col = this.cols[i];
			if(col.id === id){
				for(var key in data){
					col[key] = data[key];
				}
				this.update(function(){
					return;
				});
			}
		}
	},
	
	_row : function(id, self){
		row = {};
		if(id){
			for(var row in this.rows){
				if(row.id === id){
					return row;
				}
			}
			return null;
		}
		row.id = utils.rand();
		row.cells = [];
		var num_cols = config.default_cols;
		if(self) num_cols = self.cols.length;
		for(var i = 0; i < num_cols ; i++) {
			row.cells.unshift(new self._cell());
		}
		return row;
	},
	
	insert_row : function(callback){
		new_row = new this._row(null,this);
		this.rows.push(new_row);
		this.update(function(){
			callback(new_row);
		});
	},
	
	delete_row : function(id,callback){
		for(var i = 0 ; i < this.rows.length; i++){
			var row = this.rows[i];
			if(row.id === id){
				this.rows.splice(i,0);
				this.update(callback);
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
		cell.value = "";
		return cell;
	},
	
	update_cell: function(id,val){
		for(var i = 0; i < this.rows.length; i++){
			var row = this.rows[i];
			for(var j = 0; j < row.cells.length; j++){
				var a_cell = row.cells[j];
				if(a_cell.id === id){
					a_cell.value = val;
					this.update(function(){
						return;
					});
				}
			}
		}
	},
	
	/*add_row : function(){
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
	},*/
	
	add_column : function(options){
		self = this;
	},
	
	remove_row : function(id){},
	
	remove_column : function(id){}
}
