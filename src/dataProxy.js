var cache = require('./cache').cache,
	db = require('../node_modules/mongous').Mongous

var proxy = exports.proxy = function(){};
var counter = 0;

/*
	static methods
*/
proxy.get = function(id){
	if(cache[id]){
		cache[id].counter += 1;
		return cache[id];
	}
	else{
		db('test.ok').find(1,{'id':id},function(reply){
			if(reply.documents.length == 0){
				var doc = {'id':id,'counter':0}
				db('test.ok').save(doc);
				cache[id] = doc;
				return {'data':doc}
			}
			else{
				doc = reply.documents[0];
				doc['counter'] += 1;
				cache[id] = doc;
				db('test.ok').update({'id':id},doc);
				return doc;
			}
		});
	}
}

proxy.update = function(id,data){
	cache[id] = data;
	db('test.ok').save(data);
}

