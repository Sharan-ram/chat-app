const redis = require("redis");
const db = redis.createClient();

class getUsersFromGroup {
  static save(groupId, added, adder) {
    db.rpush(`${groupId}:users`, added, adder);
  }

  static delete(groupId, user) {
    db.lrem(`${groupId}:users`, 1, user);
  }

  static get(groupId, cb) {
    db.lrange(`${groupId}:users`, 0, -1, cb);
  }
}

module.exports = getUsersFromGroup;

/*
getUsersFromGroup.save("t11:users", "dembele", (err, res) => {
  if (err) console.log(err);
  else console.log(res);
});
*/
