const redis = require('redis')
const db = redis.createClient()

class groupContent {
  static get (groupId, cb) {
    db.lrange(`${groupId}:content`, 0, -1, cb)
  }
}

module.exports = groupContent
