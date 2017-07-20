const redis = require('redis')
const db = redis.createClient(process.env.REDIS_URL)
const getUsersFromGroup = require('./getUsersFromGroup.js')

class GroupAdmins {
  static save (groupId, adder, cb) {
    console.log('inside groupAdmin ' + groupId + ' ' + adder)
    db.incr('groupAdmin:ids', (err, id) => {
      if (err) return cb(err)
      db.hmset(`groupAdmin:${id}`, 'groupId', groupId, 'admin', adder)
      db.rpush('groupsAdminSet', JSON.stringify(`groupAdmin:${id}`), cb)
    })
  }

  static getAdminByGroupId (groupId, cb) {
    // console.log("groupname inside models function is :" + groupName);
    db.lrange('groupsAdminSet', 0, -1, (err, res) => {
      // console.log("array is :" + res);
      if (err) return cb(err)
      res.forEach(groupAdminId => {
        // console.log("groupAdmin id to be stringified is :" + groupAdminId);
        groupAdminId = groupAdminId.replace(/\"/g, '')
        db.hgetall(groupAdminId, (err, group) => {
          if (group) {
            // console.log(groupAdminId);
            // console.log(err);
            // console.log("particular group is :" + group);
            if (groupId === group['groupId']) {
              // console.log(groupName);
              return cb(err, group.admin)
            }
          }
        })
      })
    })
  }

  static changeAdmin (groupId, cb) {
    db.lrange('groupsAdminSet', 0, -1, (err, res) => {
      if (err) console.log('err retrieving groupsAdminSet:' + err)
      else {
        res.forEach(groupAdminId => {
          if (groupAdminId) {
            // console.log(groupAdminId + " groupAdminId");
            groupAdminId = groupAdminId.replace(/\"/g, '')
            db.hgetall(groupAdminId, (err, group) => {
              if (group) {
                // console.log(group + " group");
                if (groupId === group['groupId']) {
                  getUsersFromGroup.get(groupId, (err, usersArr) => {
                    if (err) console.log('err retrieving users array:' + err)
                    else {
                      // console.log(usersArr + " usersArr");
                      db.del(groupAdminId)
                      cb(err, usersArr)
                      // console.log(group["admin"] + " group admin");
                    }
                  })
                }
              }
            })
          }
        })
      }
    })
  }
}
module.exports = GroupAdmins

/* GroupAdmins.save("testingForGroups", "odemwingie", (err, res) => {
  if (err) console.log(err);
  else console.log(res);
}); */

/* GroupAdmins.getAdminByGroupName("ushoo", (err, admin) => {
  console.log(admin);
});
*/

// GroupAdmins.changeAdmin("test20");
