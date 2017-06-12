const redis = require("redis");
const bcrypt = require("bcrypt");
const db = redis.createClient();

class User {
  //storing a user to a database
  constructor(obj) {
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
  hashPassword(cb) {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) return cb(err);
      this.salt = salt;
      bcrypt.hash(this.pass, salt, (err, hash) => {
        if (err) return cb(err);
        this.pass = hash;
        cb();
      });
    });
  }
  // fetching the user from redis based on their name
  static getByName(name, cb) {
    User.getId(name, (err, id) => {
      if (err) return cb(err);
      User.get(id, cb);
    });
  }
  static getId(name, cb) {
    db.get(`user:id:${name}`, cb);
  }

  static get(id, cb) {
    db.hgetall(`user:${id}`, (err, user) => {
      if (err) return cb(err);
      cb(null, new User(user));
    });
  }
}

module.exports = User;
