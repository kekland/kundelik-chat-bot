require('dotenv').config()
const api = require('./api/kundelik')
const chat = require('./chat/chat')

const bootstrap = async () => {
  // const { token, user } = await api.signIn('iskandersiranov', 'iskander2005')
  // console.log(token)

  // const { personId } = await api.getUserInfo(token)
  // console.log(personId)

  // const { id: schoolId } = await api.getActiveSchool(token)

  // const { id: studyGroupId } = await api.getActiveStudyGroup(token, personId, schoolId)

  // const lessons = await api.getLessons(token, studyGroupId, new Date())

  // console.log(lessons.map(l => ({ name: l.subject.name, works: l.works[0] })))

  await chat.initializeBot()
}

bootstrap()
