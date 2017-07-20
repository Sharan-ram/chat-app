const redis = require('redis')
const db = redis.createClient(process.env.REDIS_URL)

class groupContent {
  static get (groupId, cb) {
    db.lrange(`${groupId}:content`, 0, -1, cb)
  }
}

module.exports = groupContent
