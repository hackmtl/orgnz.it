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
	
	// Initialize table */
	init: function(callback){
		for(var i = 0; i < orgnzit.doc.cols.length; i++){
			var a_col = orgnzit.doc.cols[i],
				col = orgnzit.UI.render_col(a_col);
			$(cols).append(col);
		}
		
		for(var i = 0; i < orgnzit.doc.rows.length; i++){
			var row = orgnzit.doc.rows[i];
			orgnzit.UI.insert_row(row);
		}
		
		$("html").click(function(){
			if(orgnzit.editing != null) orgnzit.socket.emit('request_unlock', orgnzit.editing);
		});
		callback();
	},
	
	insert_row: function(row){
		row = orgnzit.UI.render_row(row);
		$("#rows").append(row);
	},
	
	delete_row: function(id){
		$("#"+id).parent().remove();
	},
	
	insert_col: function(data){
		// add column header
		var col = orgnzit.UI.render_col(data.col);
		$("#cols").append(col);
		
		rows = $(".row");
		// add cells to each row
		for(var i = 0; i < data.cells.length; i++){
			var cell = orgnzit.UI.render_cell(data.cells[i], orgnzit.doc.cols.length - 1);
			$(rows[i]).append(cell);
		}
	},
	
	delete_col: function(id){
		$("#"+id).remove();
		$(".col_"+id).remove(); // cells in this column
	},
	
	render_col: function(a_col){
		var id = a_col.id;
		var col = $("<div class='col' id='"+id+"'></div>");
		$(col).html(a_col.name);
		orgnzit.UI.bind_click(col);
		return col;
	},
	
	render_row: function(a_row){
		var id = a_row.id;
		var container = $("<div id='"+id+"_container' class='container'><div>");
		var row = $("<div class='row' id='"+id+"'></div>");
		$(container).append(row);
		
		var delete_row = $("<a id='delete_"+id+"' class='delete_row'><img src='../images/delete-icon.png'></img></a>");
		$(delete_row).click(function(){
			orgnzit.socket.emit('delete_row', id);
			return false;
		});
		$(container).append(delete_row);
		
		var message_toggle = $("<a class='toggle_msg'><img src='../images/message.png'></img></a>");
		$(container).append(message_toggle);
		
		var messages = $("<div class='messages' id='"+id+"_messages'></div>");
		var add_message = $("<a class='add_message' id='"+id+"_add_msg'><img src='../images/add_message.png'></img></a>");
		$(messages).append(add_message);
		$(add_message).click(function(){
			var user = prompt("What name do you want to use ?");
			if(user){
				var msg = prompt("Enter your message");
				if(msg){
					orgnzit.socket.emit('post_message', { user:user, msg:msg, row:id });
				}
			}
		});
		
		$(container).append(messages);
		
		if(a_row.messages)
		for(var i = 0; i < a_row.messages.length; i++){
			var message = a_row.messages[i];
			var message = orgnzit.UI.render_message(message);
			$(messages).append(message);
		}
		
		$(message_toggle).click(function(){
			var messages = $('.messages',$(this).parent());
			if($(messages).hasClass('show')) $(messages).removeClass('show');
			else $(messages).addClass('show');
		});
		
		for(var i = 0; i < a_row.cells.length; i++){
			var a_cell = a_row.cells[i];
			var cell = orgnzit.UI.render_cell(a_cell, i); 
			$(row).append(cell);
		}
		return container;
	},
	
	post_message: function(data, row){
		var message = orgnzit.UI.render_message(data);
		$("#" + row + "_messages").append(message);
	},
	
	render_message: function(data){
		var message = $("<div class='message'><a class='user'></a> wrote: <span class='msg'></span></div>");
		$('.user', message).html(data.user);
		$('.msg', message).html(data.msg);
		return message;
	},
	
	render_cell: function(data, col){
		var col_id = (col) ? orgnzit.doc.cols[col].id : "";
		var cell = $("<div class='cell col_"+col_id+"' id='" + data.id + "'></div>");
		$(cell).html(data.value) // ! other types of data (i.e: dropdowns) will need to render accordingly
		orgnzit.UI.bind_click(cell);
		return cell;
	},
	
	update_cell : function(data){
		var new_cell = orgnzit.UI.render_cell(data),
			_cell = $("#" + data.id);
		$(_cell).html($(new_cell).html());
	},
	
	update_col : function(data){
		var new_col = orgnzit.UI.render_col(data),
			_col = $("#" + data.id);
		$(_col).replaceWith(new_col);
	},
	
	bind_click: function(cell){
		$(cell).click(function(){
			var that = this;
			if($(cell).hasClass('locked')){
				orgnzit.socket.emit('request_unlock', $(this).attr("id"));
			}
			else{
				$(".editor").each(function(){
					var id = $(this).parent().attr("id");
					if(id != $(that).attr("id")) orgnzit.socket.emit('request_unlock', id);
				});
				orgnzit.socket.emit('request_lock', $(this).attr("id"));
			}
			return false;
		});
	},
	
	unlock : function(data){
		id = data.id;
		var _cell = $("#"+id);
		$(_cell).removeClass("locked mine");
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
			val = $(_cell).html(),
			textarea = $("<textarea id='edit_"+id+"' class='editor'>"+val+"</textarea>"),
			pos = $(_cell).offset();

		$(_cell).addClass("mine").html("").append(textarea);
		
		$(textarea).focus().click(function(){
			return false;
		});
		$(textarea).keyup(function(){
			orgnzit.socket.emit('ping', id);
		});
		
		$(textarea).css( {"left":pos.left + 60, "top":pos.top + 15} );
		
		if($(_cell).hasClass('col')){
			var delete_col = $("<a id='delete_"+id+"' class='delete_col'><img src='../images/delete-icon.png'></img></a>");
			$(delete_col).click(function(){
				orgnzit.socket.emit('delete_col', id);
			});
			$(_cell).append(delete_col);
		}
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
