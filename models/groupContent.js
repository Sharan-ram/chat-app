const redis = require("redis");
const db = redis.createClient();

class groupContent {
  static get(groupName, cb) {
    db.lrange(groupName, 0, -1, cb);
  }
}

module.exports = groupContent;
