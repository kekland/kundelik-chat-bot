const Telegraf = require('telegraf').default
const { handlers } = require('./handlers')

const initializeBot = async () => {
  const token = process.env.BOT_TOKEN

  const bot = new Telegraf(token)

  bot.start(handlers.start)

  bot.hears('Расписание', handlers.handleSchedule)
  bot.on('text', handlers.generalMessage)
  bot.action()

  bot.launch({ polling: true })
}

module.exports.initializeBot = initializeBot