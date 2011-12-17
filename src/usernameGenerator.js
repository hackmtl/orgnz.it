var usersDb = require('./db_users').proxy,
        utils = require('./utils').utils,
        config = require('./config'),
        animals = require('./data/Animals.js'),
        adjectives = require('./data/Adjectives.js');

        
usernameGenerator = module.exports = function usernameGenerator(callback){
	this.data(function(generator){
		callback();
	});
}

/*
	Model
*/

usernameGenerator.prototype = {

  data : function(callback) {
    this.createAll();
    callback();
  },


  createAll : function() {
    //Create randomized Version of Lists
    rndAdj = this.randomizeArray(adjectives);
    rndAnim = this.randomizeArray(animals);

    //Add all names to Db
    for( i = 0; (i < rndAnim.length && i < rndAdj.length ); i = i + 1) {
      data = {
        name : (rndAdj[i] + " " + rndAnim[i]),
        taken : false
      }
      usersDb.upsert(data, data);
    }
  },

 
  randomizeArray: function(orderedList) {
    var rndList = [];
    var tmpList = [];
    for( i = 0; i < orderedList.length; i = i + 1)
    tmpList.push(orderedList[i]);

    while(tmpList.length > 0) {
      var idx = Math.floor(Math.random() * tmpList.length)
      rndList.push(tmpList[idx]);
      tmpList.splice(idx, 1);
      // Remove it if really found!
    }
    return rndList;
  }

}
