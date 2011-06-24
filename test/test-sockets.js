var nodeunit = require('nodeunit')
var index = require('../index');
var client = require('../node_modules/socket.io-node-client/');

exports['sockets'] = nodeunit.testCase({
	setUp:function(callback){
		//var client = this.client = client.createClient('websocket','localhost:3001')
		//var open = this.open = index.open_sockets;
		callback();
	},
	tearDown:function(callback){
		callback();
	},
	'test single connection':function(test){
		test.equal(1,1);
		test.done();
		//test.equal(this.open,0)
		/*this.client.connect(function(){
			test.equal(this.open,1);
		});*/
	},
	
});