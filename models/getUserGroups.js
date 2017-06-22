const redis = require("redis");
const db = redis.createClient();

class getUserGroups {
  static get(username, cb) {
    db.lrange(username, 0, -1, cb);
  }
}
module.exports = getUserGroups;
