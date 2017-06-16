const redis = require("redis");
const db = redis.createClient();

class ChatHistory {
  constructor(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
  save(username, data, room, cb) {
    db.incr(`message:ids`, (err, id) => {
      if (err) return cb(err);
      db.hmset(`message:${id}`, "data", data, "room", room, (err, reply) => {
        if (err) return cb(err);
        db.lpush(username, reply);
      });
    });
  }
}
module.exports = ChatHistory;

let chat = new ChatHistory({});
chat.save("sharan", "hello", "room1", () => {
  console.log(chat);
});
