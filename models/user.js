const redis = require("redis");
const bcrypt = require("bcrypt");
const db = redis.createClient();

class User {
  constructor(obj) {
    super();
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
  save(cb) {
    if (this.id) {
      this.update(cb);
    } else {
      db.incr(`user:ids`, (err, id) => {
        if (err) return cb(err);
        this.id = id;
        this.hashPassword(err => {
          if (err) return cb(err);
          this.update(cb);
        });
      });
    }
  }
  update(cb) {
    let id = this.id;
    db.set(`user:id:${this.name}`, id, err => {
      if (err) return cb(err);
      db.hmset(`user:${id}`, this, err => {
        cb(err);
      });
    });
  }
}

module.exports = User;