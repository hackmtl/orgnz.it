var db = require('./db').proxy,
	utils = require('./utils').utils,
	config = require('./config');

documents = module.exports = function documents(callback){
	this.data(function(docs){
		callback();
	});
}

/*
	Model
*/

documents.prototype = {

  data : function(callback) {
    self = this;
    db.all(function(data) {
      this.docs = data;
      callback();
    });
  }

}
