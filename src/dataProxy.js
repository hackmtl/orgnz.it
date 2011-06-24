var cache = require('./cache').cache,
	db = require('../node_modules/mongous').Mongous

var proxy = exports.proxy = function(){};
var counter = 0;
var coll = db('test.ok');

/*
	static GET method
*/
proxy.get = function(id, callback){
	cache = cache ? cache : {};
	if(cache[id]){
		/*
			return cached version of doc
		*/
		//callback(cache[id]); return;
	}
	coll.find(1, {'id':id}, function(reply){
		if(reply.documents.length == 0){
			var doc = {'id':id,'counter':0}
			db('test.ok').save(doc);
			cache[id] = doc;
			callback(doc)
		}
		else{
			doc = reply.documents[0];
			doc['counter'] += 1;
			cache[id] = doc;
			db('test.ok').update({'id':id},doc);
			callback(doc);
		}
	});
}

proxy.update = function(id,data){
	cache[id] = data;
	db('test.ok').save(data);
}

