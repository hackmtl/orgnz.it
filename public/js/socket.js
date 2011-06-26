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
		orgnzit.UI.lock(data.id);
	});

	orgnzit.socket.on('unlock', function(data){
		orgnzit.UI.unlock(data.id);
	});
	
	orgnzit.socket.on('grant', function(data){
		orgnzit.UI.edit(data.id)
	})
});
