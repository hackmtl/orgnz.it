var db = require('./db').proxy,
         utils = require('./utils').utils,
config = require('./config'); 
var         animals = require('./data/Animals.js');
var         adjectives = require('./data/Adjectives.js');

        
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
    //self = this;
    console.log("Hello " + adjectives.length)
    //console.log(adjectives)
    this.createAll();
    callback();
  },

  createAll : function()
  {
      console.log(adjectives.length)
      console.log(animals)
      //Create randomized Version of Lists
      rndAdj = this.randomizeArray(adjectives);
      rndAnim = this.randomizeArray(animals);

      //Add all names to Db
      for (i=0; (i < rndAnim.length && i < rndAdj.length );i = i+1)
      { 
	  data = {name: (rndAdj[i] + " " + rndAnim[i]), taken:false}
	  toto = db.update(data,data,{ upsert : true })
	  console.log(toto)
      }
      
  },

  randomizeArray: function(orderedList)
  {
    var rndList = [];
    var tmpList = [];
    for(i =0; i< orderedList.length; i= i+1)
	tmpList.push(orderedList[i]);

    while(tmpList.length > 0)
    { 
      var idx = Math.floor(Math.random()*tmpList.length)
      rndList.push(tmpList[idx]);
      tmpList.splice(idx, 1) ; // Remove it if really found!
    }
    return rndList;
  }

}
