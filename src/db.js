var cache = require('./cache').cache,
	db = require('../node_modules/mongous').Mongous,
	utils = require('./utils'),
	config = require('./config')

// Proxy maintains cache/db consistency */
var proxy = exports.proxy = function(){};

// get connection */
var coll = db(config.db_conn);

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
	
	coll.find(1, {'id':id}, function(reply){
		if(reply.documents.length == 0){
			callback(null);
		}
		else{
			doc = reply.documents[0];
			cache[id] = doc;
			//db(config.db_conn).update({'id':id},doc);
			callback(doc);
		}
	});
}

// static save */
proxy.save = function(doc, callback){
	db(config.db_conn).save(doc);
	callback();
}

// static update */
proxy.update = function(data,callback){
	db(config.db_conn).update({id:data.id}, data);
	console.log(callback);
	callback();
}

