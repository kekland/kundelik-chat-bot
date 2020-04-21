const low = require('lowdb')

const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ user: {} })

module.exports.setUserData = (data, replace = false) => {
  const _data = this.getUserData(data.id)

  if (replace) {
    db.set(`user.${data.id}`, { ...data }).write()
  }
  else {
    db.set(`user.${data.id}`, { ..._data, ...data }).write()
  }
}

module.exports.getUserData = (username) => {
  return db.get(`user.${username}`).value()
}