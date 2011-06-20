var express = require('express'),
	sio = require('socket.io'),
	doc = require('document'),
	user = require('user')
	/*cell = require('cell'),
	row = require('row')
	column = require('column'),*/
	/*table = require('table'),*/

var pub = __dirname + '/public/';
var app = express.createServer();

app.use(app.router);
app.use(express.static(pub));
app.use(express.errorHandler({ dump: true, stack: true }));

app.set('view engine', 'jade');
app.set('views', pub);

app.get('/', function(req, res){
	var users = {"greg":"whiteside","gabriel":"sundaram"}
	res.render('index',{'users':users})
});
app.listen(3001);

var io = sio.listen(app), users = {}
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
});
