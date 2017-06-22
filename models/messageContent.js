const redis = require("redis");
const db = redis.createClient();

class messageContent {
  static get(message, cb) {
    db.hgetall(message, cb);
  }
}
module.exports = messageContent;
