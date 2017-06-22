const redis = require("redis");
const db = redis.createClient();

class getUsersFromGroup {
  static save(groupName, adder, added) {
    db.lpush(groupName, adder, added);
  }

  static get(groupName, cb) {
    db.lrange(groupName, 0, -1, cb);
  }
}

module.exports = getUsersFromGroup;

/*
getUsersFromGroup.save("t11:users", "dembele", (err, res) => {
  if (err) console.log(err);
  else console.log(res);
});
*/
