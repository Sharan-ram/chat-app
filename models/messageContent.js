const redis = require("redis");
const db = redis.createClient();

class messageContent {
  static save(group, username, data, cb) {
    db.incr("message:ids", (err, id) => {
      if (err) return cb(err);
      db.hmset(`message:${id}`, "username", username, "data", data);
      db.rpush(group, JSON.stringify(`message:${id}`), cb);
    });
  }

  static get(message, cb) {
    db.hgetall(message, cb);
  }
}
module.exports = messageContent;

/*messageContent.save("t1", "mahesh", "hello", (err, content) => {
  console.log(content);
});*/
