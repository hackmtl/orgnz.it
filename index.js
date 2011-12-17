//require.paths.unshift(__dirname + '/socket.io/lib/');

var express = require('express'),
	sio = require('socket.io'),
	documents = require('./src/documents'),
	doc = require('./src/document'),
  usernameGenerator = require('./src/usernameGenerator'),
	user = require('./src/user'),
	users = require('./src/users'),
	monitor = require('./src/activityMonitor').monitor,
	utils = require('./src/utils').utils;

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
	res.redirect('/docs', 301);
});

app.get('/docs', function(req, res) {
  // return native mongodb row, should filter
  docs = new documents(function() {
    res.render('documents', {
      docs : docs,
      layout : false
    });
  });
});

app.get('/users', function(req, res) {
  // return native mongodb row, should filter
  user_list = new users(function() {
    res.render('users', {
      users : user_list,
      layout : false
    });
  });
});

app.get('/usernameGenerator', function(req, res) {
   generator = new usernameGenerator(function() {
       res.render('usernameGenerator', {
      layout : false
    });
  });
});

app.get('/doc/:id',function(req,res){
	the_doc = new doc(req.params.id, function(){
		if(!req.params.format) {
  		res.render('layout',{ id: the_doc.id });
    }
	});
});

app.get('/doc/:id/json',function(req,res){
  the_doc = new doc(req.params.id, function(){
    res.send(the_doc);
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

locked.on('unlocked',function(data){
	var token = utils.rand();
	io.sockets.in(room).emit('unlock', { id:data.cell, user:data.user, token:token });
});


/* Activity monitor that will check for stale/dead connections */
monitor.start();

var unlock = function(room,user){
	if(locked[room])
	for(cell in locked[room]){
		if(locked[room][cell].user == user){
			try{
				var token = utils.rand();
				io.sockets.in(room).emit('unlock', { id:cell, user:user, token:token });
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

			if(room && !locked[room]) locked[room] = {}
			
			// send user current state of room
			socket.emit('locked', locked[room]);
		}
	});
	
	/* */
	socket.on('request_lock', function(cell){
		try{
			if(!locked[socket.room]) locked[socket.room] = {}
			if(!locked[socket.room][cell]){
				var user = socket.user,
					time = new Date();
				var token = utils.rand();
				locked[socket.room][cell] = { user: user, time: time};
				io.sockets.in(socket.room).emit('lock', { id:cell, user:user, token:token });
				token = utils.rand();
				socket.emit('edit', { id: cell, token:token });
			}
		}catch(exception){}
	});
	
	socket.on('request_unlock',function( cell ){
		try{
			var is_mine = locked[socket.room][cell] && locked[socket.room][cell].user == socket.user;
			var no_ones = !locked[socket.room][cell];
			if(is_mine || no_ones){
				var user = socket.user;
				var token = utils.rand();
				if(is_mine) delete locked[socket.room][cell];
				io.sockets.in(socket.room).emit('unlock', { id:cell, user:user, token:token});
			}
		}catch(exception){}
	});
	
	socket.on('cell_updated', function( data ){
		the_doc = new doc(socket.room, function(){
			the_doc.update_cell(data.id, data.value);
			var token = utils.rand();
			data['token'] = token;
			io.sockets.in(socket.room).emit('update_cell', data);
		});
	});
	
	socket.on('col_updated', function( data ){
		the_doc = new doc(socket.room, function(){
			the_doc.update_col(data.id, data);
			var token = utils.rand();
			data['token'] = token;
			io.sockets.in(socket.room).emit('update_col', data);
		});
	});
	
	socket.on('insert_row', function(){
		the_doc = new doc(socket.room, function(){
			the_doc.insert_row(function(new_row){
				var token = utils.rand();
				var data = {row:new_row, token:token};
				io.sockets.in(socket.room).emit('insert_row', data);
			});
		});
	});
	
	socket.on('delete_row', function( row ){
		the_doc = new doc(socket.room, function(){
			the_doc.delete_row(row, function(){
				var token = utils.rand();
				var data = {row:row, token:token};
				io.sockets.in(socket.room).emit('delete_row', data);
			});
		});
	});
	
	socket.on('insert_col', function(){
		the_doc = new doc(socket.room, function(){
			the_doc.insert_col(function(new_col, new_cells){
				var token = utils.rand();
				io.sockets.in(socket.room).emit('insert_col', { col:new_col, cells:new_cells, token:token });
			});
		});
	});
	
	socket.on('delete_col', function( col ){
		the_doc = new doc(socket.room, function(){
			the_doc.delete_col(col, function(){
				var token = utils.rand();
				var data = {col:col, token:token};
				io.sockets.in(socket.room).emit('delete_col', data);
			});
		});
	});
	
	socket.on('post_message', function(data){
	  console.log(data);
	  //var user = utils.getUserinfo(data.user);
		the_doc = new doc(socket.room, function(){
			the_doc.post_message(data, function(){
				var token = utils.rand();
				data['token'] = token;
				io.sockets.in(socket.room).emit('post_message', data);
			});
		});
	});
	
	socket.on('ping', function(cell){
		try{
		if(locked[socket.room][cell] && locked[socket.room][cell].user == socket.user){
			console.log('pingd');
			date = new Date();
			locked[socket.room][cell].time = date;
		}
		}catch(exception){}
	});
	
	/* 
		remove socket on disconnect, unlock resources associated to this socket
	*/
	socket.on('disconnect', function () {
		try{
			unlock(socket.room, socket.user);
			io.sockets.in(socket.room).emit('locked',locked[socket.room]);
		}catch(exception){}
	});
});

// needed for testing
module.exports.io = io;
module.exports.app = app;
