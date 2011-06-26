/*
	Global namespace
*/
orgnzit = {};

/*
	UI methods
*/
orgnzit.UI = {
	cols : $("#cols"),
	rows : $("#rows"),
	/*
		Initialize table
	*/
	init: function(callback){
		// initialize cols
		for(var i = 0; i < orgnzit.doc.cols.length; i++){
			var a_col = orgnzit.doc.cols[i],
				col = orgnzit.UI.render_col(a_col);
			$(cols).append(col);
		}
		// initialize rows
		for(var i = 0; i < orgnzit.doc.rows.length; i++){
			var a_row = orgnzit.doc.rows[i];
			row = orgnzit.UI.render_row(a_row);
			$(rows).append(row);
		}
		callback();
	},
	
	/* Render col */
	render_col: function(a_col){
		var col = $("<div class='col' id='"+a_col.id+"'></div>");
		$(col).html(a_col.name);
		return col;
	},
	
	/* Render row */
	render_row: function(a_row){
		var row = $("<div class='row' id='"+a_row.id+"'></div>");
		for(var i = 0; i < a_row.cells.length; i++){
			var a_cell = a_row.cells[i];
			var cell = orgnzit.UI.render_cell(a_cell); 
			$(row).append(cell);
		}
		return row;
	},
	
	/* Render cell */
	render_cell: function(a_cell){
		var cell = $("<div class='cell' id='" + a_cell.id + "'></div>");
		$(cell).html(a_cell.value) // ! other types of data (i.e: dropdowns) will need to render accordingly
		return cell;
	},
	
	/* Display cell as unlocked */
	unlock : function(id){
		var _cell = $("#"+id);
		$(_cell).removeClass("locked mine").click(function(){
			orgnzit.socket.emit('request_lock', $(this).attr("id"));
		});
		var new_val = $('.editor',$(_cell)).val();
		$('.editor',$(_cell)).replaceWith(new_val);
	},

	/* Display cell as locked by someone else */
	lock : function(id){
		$(id).addClass("locked").click(function(){
			orgnzit.socket.emit('request_unlock', id);
		});
	},
	
	/* Give editing rights */
	edit : function(id){
		var _cell = $("#"+id);
		var val = $(_cell).html();
		$(_cell).addClass("mine");
		$(_cell).html("<textarea id='edit_"+id+"' class='editor'>"+val+"</textarea>");
		$(".editor",$(_cell)).focus();
	},
	
	/* Refreshes lock view */
	refresh_locked : function(){
		for(cell in orgnzit.locked){
			orgnzit.UI.lock({cell:cell, user:orgnzit.locked[cell].user});
		}
	}
}

/*
	Utilities
*/
orgnzit.utils = {
	/*
		generates random id
	*/
	rand: function(length){
		length = length || 8;
		var chars = "0123456789",
			alpha = "abcdefghijklmnopqrstuvwxyz",
			randomstring = '';
			
		for (var i=0; i < length; i++) {
			var rnum = Math.floor(Math.random() * alpha.length);
			randomstring += alpha.substring(rnum,rnum+1);
		}
		return randomstring;
	},
	
	/*
		extracts room id from url
	*/
	room: function(){
		var tokens = location.pathname.replace(/^\//,"").split('/');
		if(tokens[0] == 'doc' && tokens.length > 1) return tokens[1];
		else return null;
	}
};
