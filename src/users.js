var usersDb = require('./db_users').proxy,
	utils = require('./utils').utils,
	config = require('./config');

users = module.exports = function users(callback){
	this.data(function(users){
		callback();
	});
}

/*
	Model
*/

users.prototype = {

  data : function(callback) {
    usersDb.all(function(data) {
      this.user_list = data;
      callback();
    });
  }

}
