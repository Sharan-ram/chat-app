const redis = require('redis')
const db = redis.createClient(process.env.REDIS_URL)

class Room {
  static save (groupName, cb) {
    db.incr('group:ids', (err, id) => {
      if (err) console.log('err incrementing group:ids :' + err)
      else {
        db.set(`group:id:${groupName}`, id)
        db.hmset(`group:${id}`, 'id', id, 'groupName', groupName)
        db.rpush('groupSet', JSON.stringify(`group:${id}`), cb)
      }
    })
  }

  static getGroupNameById (groupId, cb) {
    db.hgetall(groupId, cb)
  }

  static getCurrentId (cb) {
    db.get(`group:ids`, (err, id) => {
      if (err) return cb(err)
      cb(id)
    })
  }
}

module.exports = Room

/* Room.save("test3", (err, res) => {
  console.log(res);
});
*/

/* Room.getGroupNameById("group:4", (err, obj) => {
  console.log(obj.groupName);
});
*/
/* Room.getCurrentId(id => {
  console.log(id);
});
*/
