var cache = require('./cache').cache,
	db = require('mongous').Mongous,
	utils = require('./utils'),
	config = require('./config')

// Proxy maintains cache/db consistency */
var proxy = exports.proxy = function(){};

// get connection */
var collDoc = db('test.doc');

// static get  */
proxy.get = function(id, callback){
	/* 
		return cached version of doc if it exists - use Redis instead of in-memory ?
		turned off for now 
	*/
	cache = cache ? cache : {};
	if(cache[id]){
		//callback(cache[id]); return;
	}
	
	collDoc.find(1, {'id':id}, function(reply){
		if(reply.documents.length == 0){
			callback(null);
		}
		else{
			doc = reply.documents[0];
			cache[id] = doc;
			//collDoc.update({'id':id},doc);
			callback(doc);
		}
	});
}

// static save */
proxy.save = function(doc, callback){
	collDoc.save(doc);
	callback();
}

// static update */
proxy.update = function(data,callback){
	collDoc.update({id:data.id}, data);
	callback();
}

proxy.all = function (callback) {
  collDoc.find({}, function(reply) {
    callback(reply.documents);
  });
}

