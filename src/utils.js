var utils = exports.utils = function(){};

utils.rand = function(){
	var chars = "0123456789";
	var alpha = "abcdefghijklmnopqrstuvwxyz";
	var randomstring = '';
	for (var i=0; i < 8; i++) {
		var rnum = Math.floor(Math.random() * alpha.length);
		randomstring += alpha.substring(rnum,rnum+1);
	}
	return randomstring;
}