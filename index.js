var express = require('express'),
	sio = require('socket.io'),
	doc = require('./src/document'),
	user = require('./src/user')

var pub = __dirname + '/public';
var app = express.createServer();

app.use(app.router);
app.use(express.static(pub));
app.use(express.errorHandler({ dump: true, stack: true }));

app.set('view engine', 'jade');
app.set('views', pub + "/views");

app.get('/', function(req, res){
	my_doc = new doc();
	// redirect to /{new_id}
	res.redirect('/tables/' + my_doc.id,301)
});

app.get('/tables/:id',function(req,res){
	my_doc = new doc(req.params.id);
	var data = my_doc['data'];
	res.render('index', {'id':data.id, 'counter':data.counter});
});

app.listen(3001);

/*var io = sio.listen(app), users = {}
io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

io.sockets.on('connection', function (socket) {
  socket.on('update', function (data) {
    socket.broadcast.emit('user message', socket.nickname, msg);
  });
});*/
