/*
	Global namespace
*/
orgnzit = {};

/*
	Template methods
*/
var tpl = {
	del_row : _.template("<td class='controls'><a id='delete_<%=id%>' class='delete_row'><img src='../images/delete-icon.png'></img></a></td>")
};

/*
	UI methods
*/
orgnzit.UI = {
	cols : "#table thead tr",
	rows : "#table tbody",
	
	// Initialize table */
	init: function(callback){
	  	
		for(var i = 0; i < orgnzit.doc.cols.length; i++){
			var a_col = orgnzit.doc.cols[i],
				col = this.render_col(a_col);
			$(this.cols).append(col);
		}
		$(this.cols).append("<th class='controls' />")
		
		for(var i = 0; i < orgnzit.doc.rows.length; i++){
			var row = orgnzit.doc.rows[i];
			this.insert_row(row);
		}
		
		$("html").click(function(){
			if(orgnzit.editing != null) orgnzit.socket.emit('request_unlock', orgnzit.editing);
		});
		
		callback();
	},
	
	insert_row: function(row){
		row = orgnzit.UI.render_row(row);
		$(this.rows).append(row);
	},
	
	delete_row: function(id){
		$("#"+id).remove();
	},
	
	insert_col: function(data){
		// add column header
		var col = orgnzit.UI.render_col(data.col);
		col.insertBefore(this.cols + " .controls");
		
		rows = $(".row");
		// add cells to each row
		for(var i = 0; i < data.cells.length; i++){
			var cell = orgnzit.UI.render_cell(data.cells[i], orgnzit.doc.cols.length - 1);
			$(cell).insertBefore($(rows[i]).find(".controls"));
		}
	},
	
	delete_col: function(id){
		$("#"+id).remove();
		$(".col_"+id).remove(); // cells in this column
	},
	
	render_col: function(data){
		var id = data.id,
			col = $("<th class='col' id='"+id+"'></th>"),
			editor = $('<input class="editor" value="'+data.name+'" readonly="readonly" />');
		
		$(col).append(editor);
		orgnzit.UI.bind_click(col);
		return col;
	},
	
	render_row: function(a_row){
		var id = a_row.id;
		var row = $("<tr class='row' id='"+id+"'></tr>");
		
    	var delete_row = $(tpl.del_row({id:id}));
		
		$(delete_row).find('.delete_row').on('click', function(){
			orgnzit.socket.emit('delete_row', id);
			return false;
		});
		
		for(var i = 0; i < a_row.cells.length; i++){
			var a_cell = a_row.cells[i];
			var cell = orgnzit.UI.render_cell(a_cell, i); 
			$(row).append(cell);
		}		
		$(row).append(delete_row);
		
		var messages = $("<div class='messages' style='display:none;' id='"+id+"_messages'></div>");
		$(row).find(".controls").append(messages);
		if(a_row.messages)
		for(var i = 0; i < a_row.messages.length; i++){
			var message = a_row.messages[i];
			var message = orgnzit.UI.render_message(message);
			$(messages).append(message);
		}
		
		var add_message = $("<textarea class='conversation-text' id='"+id+"_add_msg'></textarea><input data-id='"+id+"' id='"+id+"_post_msg' type=\"submit\" class=\"button\" value='Post' />");
		$(messages).append(add_message);
		$("#"+id+"_post_msg").live("click", function(){
			id = $(this).data("id");
			msg = $(this).siblings(".conversation-text").val();
			if(msg.length > 0) {
				if(typeof(localStorage["userId"])=="undefined"){
					var user = prompt("What name do you want to use ?");
				} else {
					var user = localStorage["userId"];
				}
				if(user){
					localStorage["userId"] = user
					orgnzit.socket.emit('post_message', { user:user, msg:msg, row:id });
				}
			}
		});
		
		return row;
	},
	
	post_message: function(data, row){
		var message = orgnzit.UI.render_message(data);
		message.insertBefore($("#" + row + "_messages").find(".conversation-text"));
		this.refresh_messages("#" + row + "_messages");
	},
	
	render_message: function(data){
		var message = $("<div class='message'><p class='msg'></p><p><a class='user'></a></p></div>");
		$('.user', message).html(data.user);
		$('.msg', message).html(data.msg);
		return message;
	},
	
	render_cell: function(data, col){
		var col_id = (col >= 0) ? orgnzit.doc.cols[col].id : "",
			cell = $("<td class='cell col_"+col_id+"' id='" + data.id + "'></td>"),
			editor = $('<input class="editor" value="'+data.value+'" readonly="readonly" />');
		

		$(cell).append(editor) // ! other types of data (i.e: dropdowns) will need to render accordingly
		orgnzit.UI.bind_click(cell);
		return cell;
	},
	
	update_cell : function(data){
		var new_cell = orgnzit.UI.render_cell(data),
			_cell = $("#" + data.id);
		
		_cell.html($(new_cell).html());
	},
	
	update_col : function(data){
		var new_col = orgnzit.UI.render_col(data),
			_col = $("#" + data.id);
		
		_col.replaceWith(new_col);
	},
	
	bind_click: function(cell){
		var $cell = $(cell);

		$cell.on('focus click', '.editor', function(){
			var that = this,
				cellId = $cell.attr('id');

			if($cell.hasClass('s-focus')) {
				return false;
			} else if($cell.hasClass('locked')) {
				orgnzit.socket.emit('request_unlock', cellId);
			} else {
				$(".editor:not([readonly])").each(function(){
					var id = $(this).parent().attr("id");
					if(id != cellId) orgnzit.socket.emit('request_unlock', id);
				});
				orgnzit.socket.emit('request_lock', cellId);
			}
		});
	},
	
	unlock : function(data){
		id = data.id;
		var _cell = $("#"+id);
		$(_cell).removeClass("locked s-focus");
		$('.remove_col',$(_cell)).remove();
		
		if(orgnzit.editing === id){
			var new_val = $('.editor',$(_cell)).val();
			$('.editor',$(_cell)).replaceWith(new_val);
			if($(_cell).hasClass('col'))
				orgnzit.socket.emit('col_updated', {id:id, name:new_val});
			else
				orgnzit.socket.emit('cell_updated', {id:id, value:new_val});
			orgnzit.editing = null;
		}
		return false;
	},

	lock : function(data){
		id = data.id;
		var _cell = $("#"+id)
		$(_cell).addClass("locked");
	},
	
	edit : function(data){
		id = data.id;
		var _cell = $("#"+id),
			editor = $(_cell).children('input'),
			val = editor.val();

		_cell.addClass("s-focus");
		
		editor
			.removeAttr('readonly')
			.keyup(function(){ orgnzit.socket.emit('ping', id); });
		

		if($(_cell).hasClass('col')){
			var delete_col = $("<a id='delete_"+id+"' class='delete_col'><img src='../images/delete-icon.png'></img></a>");
			
			delete_col.click(function(){
				orgnzit.socket.emit('delete_col', id);
			});
			$(_cell).append(delete_col);
		}
		this.refresh_messages($(_cell).siblings(".controls").find(".messages"));
	},
	
	refresh_messages : function(messages){
		$("#active-conversations").html($(messages).html());
	},
	
	refresh_locked : function(){
		for(cell in orgnzit.locked){
			orgnzit.UI.lock({ id:cell, user:orgnzit.locked[cell].user });
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
