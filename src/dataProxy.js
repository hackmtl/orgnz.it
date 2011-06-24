var cache = require('./cache').cache,
	db = require('../node_modules/mongous').Mongous,
	utils = require('./utils');

var proxy = exports.proxy = function(){};
var counter = 0;
var coll = db('test.ok');

/*
	static GET method
*/
proxy.get = function(id, callback){
	cache = cache ? cache : {};
	if(cache[id]){
		/* return cached version of doc */
		//callback(cache[id]); return;
	}
	coll.find(1, {'id':id}, function(reply){
		if(reply.documents.length == 0){
			callback(null);
		}
		else{
			doc = reply.documents[0];
			cache[id] = doc;
			db('test.ok').update({'id':id},doc);
			callback(doc);
		}
	});
}

proxy.save = function(doc,callback){
	coll.save(doc.data);
	callback();
}

proxy.update = function(id,data){
	cache[id] = data;
	db('test.ok').save(data);
}

