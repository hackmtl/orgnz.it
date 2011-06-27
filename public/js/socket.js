orgnzit.socket = io.connect('http://localhost');
/*
	When client opens socket, return list of locked resources
*/

orgnzit.user = orgnzit.utils.rand();
orgnzit.room = orgnzit.utils.room();
orgnzit.locked = {};
orgnzit.editors = {};

orgnzit.socket.on('connect', function () {
	orgnzit.socket.emit('hello', {user:orgnzit.user, room:orgnzit.room});
	
	orgnzit.socket.on('locked', function(locked){
		orgnzit.locked = locked;
		orgnzit.UI.refresh_locked();
	});
	
	orgnzit.socket.on('lock', function(data){
		orgnzit.UI.lock(data);
	});

	orgnzit.socket.on('unlock', function(data){
		orgnzit.UI.unlock(data);
	});
	
	orgnzit.socket.on('edit', function(data){
		orgnzit.UI.edit(data)
	});
	
	// data updates
	orgnzit.socket.on('update_cell', function(data){
		orgnzit.UI.update_cell(data);
	});
	
	orgnzit.socket.on('update_col', function(data){
		orgnzit.UI.update_col(data);
	})
	
	orgnzit.socket.on('insert_col', function(data){
		orgnzit.doc.cols.push(data.col);
		for(var i = 0; i < data.cells.length; i++){
			orgnzit.doc.rows[i].cells.push(data.cells[i]);
		}
		orgnzit.UI.insert_col(data);
	});
	
	orgnzit.socket.on('insert_row', function(data){
		orgnzit.doc.rows.push(data);
		orgnzit.UI.insert_row(data);
	});
	
	orgnzit.socket.on('delete_row', function(id){
		for(var i = 0; i < orgnzit.doc.rows.length; i++){
			var row = orgnzit.doc.rows[i];
			if(row.id === id) orgnzit.doc.rows.splice(i,1);
		}
		orgnzit.UI.delete_row(id);
	});
	
	orgnzit.socket.on('delete_col', function(id){
		for(var i = 0 ; i < orgnzit.doc.cols.length; i++ ){
			var col = orgnzit.doc.cols[i];
			if(col.id === id){
				offset = i;
				orgnzit.doc.cols.splice(i,1);
			}
		}
		if(offset)
		for(var j = 0; j < orgnzit.doc.rows.length; j++){
			orgnzit.doc.rows[j].cells.splice(offset,1);
		}
		orgnzit.UI.delete_col(id);
	});
	
	orgnzit.socket.on('post_message', function(data){
		var row = data.row;
		orgnzit.UI.post_message(data, row);
	});
});
