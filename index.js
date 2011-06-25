require.paths.unshift(__dirname + '/node_modules/socket.io/lib/');

var express = require('express'),
	sio = require('socket.io'),
	doc = require('./src/document'),
	user = require('./src/user')
	monitor = require('./src/activityMonitor').monitor

/*
	Configure Web Server
*/
var app = express.createServer();
var pub = __dirname + '/public';
app.use(app.router);
app.use(express.static(pub));
app.use(express.errorHandler({ dump: true, stack: true }));
app.use(express.compiler({src: pub , enable: ['less']}));
app.set('view engine', 'jade');
app.set('views', pub + "/views");

/*
	Routing
*/
app.get('/', function(req, res){
	new_doc = new doc(null,function(){
		res.redirect('/doc/' + new_doc.id, 301) // redirect to /new_doc
	});
});

app.get('/doc/:id',function(req,res){
	the_doc = new doc(req.params.id, function(){
		if(!req.params.format) // render html
		res.render('layout',{ id: the_doc.data.id });
	});
});

app.get('/doc/:id/json',function(req,res){
	the_doc = new doc(req.params.id, function(){
		res.send(the_doc.data);
	});
});

/* Start web server */
app.listen(3001);

/* 
	Configure Sockets
*/
var io = sio.listen(app);
var connections = {}
io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);

/* 
	Global lock list
*/
var locked = require('./src/locked').locked;

locked.on('unlocked',function(cell){
	io.sockets.in(room).emit('unlock', { cell:cell.cell, user:cell.user});
});

var open_sockets = {};

/* Activity monitor that will check for stale/dead connections */
monitor.start();

var unlock = function(room,user){
	if(locked[room])
	for(cell in locked[room]){
		if(locked[room][cell].user == user){
			try{
				io.sockets.in(room).emit('unlock', { cell:cell, user:user});
			}catch(exception){ console.log("ERROR: couldn't unlock user " + user) }
			delete locked[room][cell];
		}
	}
}

io.sockets.on('connection', function (socket) {
	/* 
		'handshake'
	*/
	socket.on('hello', function(data){
		if(data.user && data.room) {
			// setup socket data
			socket.user = data.user;
			room = data.room; // == doc.id
			socket.room = room;
			socket.join(room);
			
			// if new room, set it up on server
			if(!open_sockets[room]) open_sockets[room] = {};
			open_sockets[room][data.user] = socket;
			if(!locked[room]) locked[room] = {}
			
			// send user current state of room
			socket.emit('locked',locked[room]);
		}
	});
	
	/* */
	socket.on('lock', function(cell){
		if(!locked[socket.room]) locked[socket.room] = {}
		if(!locked[socket.room][cell]){
			var user = socket.user,
				time = new Date();
			locked[socket.room][cell] = { user: user, time: time};
			try{
				io.sockets.in(socket.room).emit('lock', { cell:cell, user:user });
			}catch(exception){ console.log("ERROR: couldn't lock " + cell) }
		}
	});
	
	/* */
	socket.on('unlock',function(cell){
		if(locked[socket.room][cell] && locked[socket.room][cell].user == socket.user){
			delete locked[socket.room][cell];
			try{
				io.sockets.in(socket.room).emit('unlock', { cell:cell, user:user });
			}catch(exception){ console.log("ERROR: couldn't unlock " + cell) }
		}
	});
	
	/* remove socket on disconnect, unlock resources associated to this socket */
	socket.on('disconnect', function () {
		if(open_sockets[socket.room][socket.users]) delete open_sockets[socket.room][socket.user];
		unlock(socket.room,socket.user);
		io.sockets.in(socket.room).emit('locked',locked[socket.room]);
	});
});

// needed for testing
module.exports.io = io;
module.exports.open_sockets = open_sockets;
module.exports.app = app;
