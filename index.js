require.paths.unshift(__dirname + '/node_modules/socket.io/lib/');

var express = require('express'),
	sio = require('socket.io'),
	doc = require('./src/document'),
	user = require('./src/user')

var pub = __dirname + '/public';
var app = express.createServer();
//var room;

app.use(app.router);
app.use(express.static(pub));
app.use(express.errorHandler({ dump: true, stack: true }));

app.set('view engine', 'jade');
app.set('views', pub + "/views");

app.get('/', function(req, res){
	new_doc = new doc(null,function(){
		res.redirect('/doc/' + new_doc.id, 301) // redirect to /new_doc
	});
});

app.get('/doc/:id',function(req,res){
	//room = req.params.id;
	the_doc = new doc(req.params.id, function(){
		res.render('index', {'id':the_doc.id, 'counter':the_doc.data.counter});
	});
});

app.listen(3001);

var io = sio.listen(app);
var connections = {}
io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);

var locked = {};
var open_sockets = {};

var unlock = function(user){
	for(cell in locked){
		if(locked[cell].user == user){
			try{
				io.sockets.in(room).emit('unlock', { cell:cell, user:user});
			}catch(exception){ console.log("ERROR: couldn't unlock user " + user) }
			delete locked[cell];
		}
	}
}

io.sockets.on('connection', function (socket) {
	
	socket.on('user', function(data){
		socket.user = data.user;
		socket.join(room);
		console.log('joined ' + room)
		open_sockets[data.user] = socket;
		socket.emit('locked',locked);
	});
	
	/* */
	socket.on('lock', function(cell){
		if(!locked[cell]){
			var user = socket.user;
			locked[cell] = { user: user};
			//console.log(req.params.id);
			try{
				io.sockets.in(room).emit('lock', { cell:cell, user:user });
			}catch(exception){ console.log("ERROR: couldn't lock " + cell) }
		}
	});
	
	/* */
	socket.on('unlock',function(cell){
		if(locked[cell] && locked[cell].user == socket.user){
			delete locked[cell];
			try{
				io.sockets.in(room).emit('unlock', { cell:cell, user:user });
			}catch(exception){ console.log("ERROR: couldn't unlock " + cell) }
		}
	});
	
	/* remove socket on disconnect, unlock resources associated to this socket */
	socket.on('disconnect', function () {
	    try{
			delete open_sockets[socket.user];
			unlock(socket.user);
			io.sockets.in(room).emit('locked',locked);
			console.log("closed " + socket.user)
		}catch(exception){console.log("couldn't close socket " + socket.user)}
	});
});

// needed for testing
module.exports.io = io;
module.exports.open_sockets = open_sockets;
module.exports.app = app;
