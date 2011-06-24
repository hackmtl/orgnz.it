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
		orgnzit.refresh_locked();
	});
	
	orgnzit.socket.on('lock',function(cell){
		orgnzit.lock(cell);
	});

	orgnzit.socket.on('unlock',function(cell){
		orgnzit.unlock(cell);
	});
});
