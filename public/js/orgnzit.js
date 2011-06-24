orgnzit = {
	
	unlock : function(cell){
		cell = (typeof cell == 'string') ? cell : cell.cell;
		$("#"+cell).removeClass("locked mine").click(function(){
			orgnzit.socket.emit('lock', $(this).attr("id"));
		});
	},

	lock : function(cell){
		$("#"+cell.cell).addClass("locked").click(function(){
			orgnzit.socket.emit('unlock', $(this).attr("id"));
		});
		if(cell.user == orgnzit.user){
			orgnzit.mine(cell.cell);
		}
	},

	mine : function(cell){
		$("#"+cell).addClass("mine");
	},

	refresh_locked : function(){
		for(cell in orgnzit.locked){
			orgnzit.lock({cell:cell, user:orgnzit.locked[cell].user});
		}
	}
};

orgnzit.utils = {
	rand: function(){
		var chars = "0123456789";
		var alpha = "abcdefghijklmnopqrstuvwxyz";
		var randomstring = '';
		for (var i=0; i < 8; i++) {
			var rnum = Math.floor(Math.random() * alpha.length);
			randomstring += alpha.substring(rnum,rnum+1);
		}
		return randomstring;
	}
};
