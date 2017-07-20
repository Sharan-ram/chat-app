const redis = require('redis')
const db = redis.createClient()

class getUserGroups {
  static save (username, groupId, cb) {
    db.lpush(username, groupId, cb)
  }

  static delete (username, groupId) {
    db.lrem(username, 1, groupId)
  }

  static get (username, cb) {
    db.lrange(username, 0, -1, cb)
  }
}
module.exports = getUserGroups

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
