const api = require('../api/kundelik')
const Telegraf = require('telegraf')
const { setUserData, getUserData } = require('../api/database')

const menus = {
  mainMenu: Telegraf.Extra.markdown().markup((m) => m.keyboard([
    m.callbackButton('Расписание', 'schedule'),
    m.callbackButton('Домашняя работа', 'homework'),
    m.callbackButton('Оценки', 'grades')
  ])),
  dayOfWeekSelection: Telegraf.Extra.markdown().markup((m) => m.keyboard([
    m.callbackButton('Понедельник', { type: 'schedule', day: 1 }),
    m.callbackButton('Вторник', { type: 'schedule', day: 2 }),
    m.callbackButton('Среда', { type: 'schedule', day: 3 }),
    m.callbackButton('Четверг', { type: 'schedule', day: 4 }),
    m.callbackButton('Пятница', { type: 'schedule', day: 5 }),
    m.callbackButton('Суббота', { type: 'schedule', day: 6 }),
  ]))
}

const handlers = {
  start: async (ctx) => {
    setUserData({ id: ctx.message.from.username, username: null, token: null })
    await ctx.reply('Привет! Добро пожаловать в телеграм-бот для kundelik.kz!')

    if (!getUserData(ctx.message.from.username).token) {
      await ctx.reply('Первым делом вам нужно войти в систему.')
      handlers.requireUsername(ctx)
    }
    else {
      handlers.requirePassword(ctx)
    }
  },
  checkToken: async (ctx, callback) => {
    const userData = getUserData(ctx.message.from.username)
    try {
      console.log(userData)
      const apiData = await api.getUserInfo(userData.token)
      setUserData({ ...userData, info: apiData })

      await callback(userData)
    }
    catch (e) {
      console.error(e)
      await ctx.reply('Необходимо перезайти в систему.', Telegraf.Markup.inlineKeyboard([]))
      await handlers.requireSignIn(ctx)
    }
  },
  requireSignIn: async (ctx) => {
    const userData = getUserData(ctx.message.from.username)

    if (!userData || !userData.username) {
      await handlers.requireUsername(ctx)
    }
    else {
      await handlers.requirePassword(ctx)
    }
  },
  requireUsername: async (ctx) => {
    setUserData({ id: ctx.message.from.username, username: null, token: null, info: null }, true)
    await ctx.reply('Ваше имя пользователя:')
  },
  requirePassword: async (ctx) => {
    const data = getUserData(ctx.message.from.username)
    setUserData({ id: ctx.message.from.username, username: data.username, token: null, info: null }, true)
    await ctx.reply('Ваш пароль:')
  },
  generalMessage: async (ctx) => {
    const userData = getUserData(ctx.message.from.username)

    if (!userData || !userData.username) {
      setUserData({ id: ctx.message.from.username, username: ctx.message.text })
      handlers.requirePassword(ctx)
    }
    else if (!userData.token) {
      try {
        handlers.handleSignIn(ctx, userData.username, ctx.message.text)
      }
      catch (e) {
        await ctx.reply('Неправильное имя пользователя или пароль. Попробуйте ещё раз:')
        await handlers.requireUsername(ctx)
      }
    }
  },
  handleSignIn: async (ctx, username, password) => {
    const userData = getUserData(ctx.message.from.username)

    const { token } = await api.signIn(username, password)
    const apiData = await api.getUserInfo(token)
    const { id: schoolId } = await api.getActiveSchool(token)
    const groupData = await api.getActiveStudyGroup(token, apiData.personId, schoolId)

    setUserData({ ...userData, token, schoolId, groupData, info: apiData })

    await ctx.reply(`Добро пожаловать, ${apiData.shortName}`, menus.mainMenu)
  },
  handleSchedule: async (ctx) => {
    await handlers.checkToken(ctx, async (userData) => {
      await ctx.reply('На какой день недели показать расписание?', menus.dayOfWeekSelection)
    })
  }
}

module.exports.handlers = handlers