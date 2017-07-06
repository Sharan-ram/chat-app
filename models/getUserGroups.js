const redis = require("redis");
const db = redis.createClient();

class getUserGroups {
  static save(username, group, cb) {
    db.lpush(username, group, cb);
  }

  static delete(username, group) {
    db.lrem(username, 1, group);
  }

  static get(username, cb) {
    db.lrange(username, 0, -1, cb);
  }
}
module.exports = getUserGroups;

/*
getUserGroups.save("mahesh", "t50", (err, res) => {
  if (err) console.log(err);
  else console.log(res);
});
*/
/*
getUserGroups.get("marsh", (err, res) => {
  console.log(res);
});
*/
