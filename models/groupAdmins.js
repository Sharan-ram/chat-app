const redis = require("redis");
const db = redis.createClient();

class GroupAdmins {
  static save(groupName, adder, cb) {
    db.incr("groupAdmin:ids", (err, id) => {
      if (err) return cb(err);
      db.hmset(`groupAdmin:${id}`, "groupName", groupName, "admin", adder);
      db.rpush("groupsAdminSet", JSON.stringify(`groupAdmin:${id}`), cb);
    });
  }
  static getAdminByGroupName(groupName, cb) {
    db.lrange("groupsAdminSet", 0, -1, (err, res) => {
      //console.log("array is :" + res);
      if (err) return cb(err);
      res.forEach(groupAdminId => {
        //console.log(groupAdminId);
        groupAdminId = groupAdminId.replace(/\"/g, "");
        db.hgetall(groupAdminId, (err, group) => {
          //console.log(group);
          if (groupName === group.groupName) {
            //console.log(groupName);
            return cb(err, group.admin);
          }
        });
      });
    });
  }
}
module.exports = GroupAdmins;

/*GroupAdmins.save("testingForGroups", "odemwingie", (err, res) => {
  if (err) console.log(err);
  else console.log(res);
});*/

/*GroupAdmins.getAdminByGroupName("ushoo", (err, admin) => {
  console.log(admin);
});
*/
