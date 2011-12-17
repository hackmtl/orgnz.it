var utils = exports.utils = function() {
};

utils.rand = function() {
  var chars = "0123456789";
  var alpha = "abcdefghijklmnopqrstuvwxyz";
  var randomstring = '';
  for(var i = 0; i < 8; i++) {
    var rnum = Math.floor(Math.random() * alpha.length);
    randomstring += alpha.substring(rnum, rnum + 1);
  }
  return randomstring;
}

utils.getUserinfo = function(userId) {
  var userInfo = null;
  usersDb = require('./db_users').proxy;
  console.log(userId);
  if(userId) {
    usersDb.getById(userId, function(user) {
      console.log(user);
      userInfo = user;
    });

  } else {
    usersDb.find({
      taken : false
    }, function(userList) {
      console.log(userList);
      userInfo = userList[0];
      usersDb.update(userId, {
        taken : true
      });
    });

  }
  console.log(userInfo);
  return userInfo;
}