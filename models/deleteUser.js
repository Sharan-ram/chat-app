const redis = require("redis");
const db = redis.createClient();

class DeleteUser {
  static delete(groupName, username, cb) {
    db.lrem(`${groupName}:users`, 1, username, (err, res) => {
      if (err) return cb(err);
      db.lrem(username, 1, groupName, (err, res) => {
        if (err) return cb(err);
        cb(res);
      });
    });
  }
}
module.exports = DeleteUser;

/*
DeleteUser.delete("friends", "sharan", (err, res) => {
  console.log(res);
});
*/
