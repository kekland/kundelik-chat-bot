const axios = require('axios').default

const api = {
  baseUrl: 'https://api.kundelik.kz/v2.0',
  getHeaders: (accessToken) => ({
    'Access-Token': accessToken,
  }),
  signIn: async (username, password) => {
    const response = await axios.post(`${api.baseUrl}/authorizations/bycredentials`, {
      username,
      password,
      "client_id": "387d44e3-e0c9-4265-a9e4-a4caaad5111c",
      "client_secret": "8a7d709c-fdbb-4047-b0ea-8947afe89d67",
      "scope": "Schools,Relatives,EduGroups,Lessons,marks,EduWorks,Avatar,EducationalInfo,CommonInfo,ContactInfo,FriendsAndRelatives,Files,Wall,Messages"
    })

    return {
      token: response.data.accessToken,
      user: response.data.user,
    }
  },
  getSchools: async (accessToken) => {
    const response = await axios.get(`${api.baseUrl}/users/me/schools`, { headers: api.getHeaders(accessToken) })

    return {
      schools: response.data
    }
  },
  getActiveSchool: async (accessToken) => {
    const schools = await api.getSchools(accessToken)

    if (schools.length === 1)
      return schools[0]
    else
      throw new Error('Multiple schools present or none exists')
  },
  getUserInfo: async (accessToken) => {
    const response = await axios.get(`${api.baseUrl}/users/me`, { headers: api.getHeaders(accessToken) })

    return {
      id: response.data.id,
      shortName: response.data.shortName,
      personId: response.data.personId,
    }
  },
  getActiveStudyGroup: async (accessToken, personId, schoolId) => {
    const response = await axios.get(`${api.baseUrl}/persons/${personId}/schools/${schoolId}/edu-groups`, { headers: api.getHeaders(accessToken) })

    const activeGroups = response.data.filter((group) => group.status === 'Active')

    if (activeGroups.length === 0) return {}
    const group = activeGroups[0]

    return {
      id: group.id,
      name: group.fullName,
      timetableId: group.timetable,
      subjects: group.subjects,
    }
  },
  getLessons: async (accessToken, eduGroupId, _date) => {
    const date = new Date(_date)

    const response = await axios.get(`${api.baseUrl}/edu-groups/${eduGroupId}/lessons/${date.toISOString()}/${date.toISOString()}`, { headers: api.getHeaders(accessToken) })

    return response.data
  }
}

module.exports = api;