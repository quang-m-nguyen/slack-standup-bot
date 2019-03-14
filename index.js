const questions = require('./constant')
const SlackBot = require('slackbots')
const axios = require('axios')
const dotenv = require('dotenv')
const uuid = require('uuid')
const channelID = require('./app/bot-utils/detect-channel')

console.log('channelID', channelID)
dotenv.config()
// let questions = ['Im here sir.  Type anything to start the standup.',
//   'what did you do yesterday?', 'what did you do today?', 'are you blocked?']

let channel = ''
let token = process.env.TOKEN
let user = process.env.STANDUP_USER
let state = {
  standUpResponses: {}
}
state.standUpResponses[user] = []
console.log('user =>', user)
const bot = new SlackBot({
  token: token,
  name: 'qslackbot'
})

handleStandUpResponse = (event) => {
  console.log('isUserResponseToStandUp(event)', isUserResponseToStandUp(event))
  let timeStamp = new Date().getTime()
  let id = uuid.v1()
  let question = questions[state.standUpResponses[user].length]
  let standUp = { timestamp: timeStamp, message: event.content, id: id, user: user, question: question }
  if (isUserResponseToStandUp(event)) {
    bot.postMessageToUser(user, `Thank you for your response! received: ${event.content} state: ${JSON.stringify(state)}`).always(function (data) {
      state.standUpResponses[user].push(standUp)
      askStandupQuestion(state.standUpResponses[user].length)
    })
  }
}

isUserResponseToStandUp = (event) => {
  return (event.channel === channel && event.content && event.subtitle && !event.subtitle.includes('(bot)'))
}

askStandupQuestion = (size) => {
  let qToAsk = ''
  if (size >= questions.length) {
    qToAsk = 'Thank you for your standup responses.  I will save it to the database now'
    saveStandUpResponseToServer(state.standUpResponses[user])
  } else {
    qToAsk = questions[size]
  }

  bot.postMessageToUser(user, qToAsk).always(function (data) {
    // console.log('user response data: ', data)
  })
}

startStandUp = () => {
  let qNum = 0
  bot.postMessageToUser(user, askStandupQuestion(qNum)).always(function (data) {
    // console.log('user response data: ', data)
  })
}

detectChannelId = (event) => {
  if (event.content === questions[0]) {
    return event.channel
  } else {
    return ''
  }
}

saveStandUpResponseToServer = (responseList) => {
  let payload = {
    records: responseList
  }

  axios.post('https://hm1knqbct0.execute-api.us-east-1.amazonaws.com/dev/saveUserStandupResponse', payload)
    .then(function (response) {
      console.log('save to server response', response)
    })
    .catch(function (error) {
      console.log(error)
    })
}

bot.on('start', () => {
  bot.postMessageToUser(user, questions[0]).always(function (data) {
    // console.log('user response data: ', data)
  })
})

bot.on('error', err => console.log(err))

bot.on('message', data => {
  console.log('detected a message: ', data)
  if (channelID(data) !== '') {
    channel = channelID(data)
  }
  handleStandUpResponse(data)
  if (data.type !== 'message') {

  }
})
