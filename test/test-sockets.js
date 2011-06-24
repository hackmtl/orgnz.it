var nodeunit = require('nodeunit')
var index = require('../index');
var client = require('../node_modules/socket.io-node-client/');

exports['sockets'] = nodeunit.testCase({
	setUp:function(callback){
		callback();
	},
	tearDown:function(callback){
		callback();
	},
	'test single connection':function(test){
		test.equal(1,1);
		test.done();
	},
	
});