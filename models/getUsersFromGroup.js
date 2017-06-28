const redis = require("redis");
const db = redis.createClient();

class getUsersFromGroup {
  static save(groupName, added, adder) {
    db.lpush(groupName, added, adder);
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
