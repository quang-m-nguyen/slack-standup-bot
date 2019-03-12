const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv')

dotenv.config();
let state = {
    standUpResponses: {}
}
state.standUpResponses[user] = []

let questions = ['Im here sir.  Type anything to start the standup.','what did you do yesterday?', 'what did you do today?', 'are you blocked?']

let channel = ''
let token = process.env.TOKEN
let user = process.env.STANDUP_USER
console.log('user =>', user)
const bot = new SlackBot({
    token: token,
    name: 'qslackbot'
});

bot.on('start', () => {

    bot.postMessageToUser(user, questions[0]).always(function(data) {
        //console.log('user response data: ', data)
    })
});

bot.on('error', err => console.log(err));

bot.on('message', data => {
    console.log('detected a message: ', data)
    if (detectChannelId(data) !== ''){
        channel = detectChannelId(data)
    }
    handleStandUpResponse(data)
    if (data.type !== 'message') {
        return;
    }

    handleMessage(data.text);
});

// Respons to Data
function handleMessage(message) {
    //console.log('received message:', message)
    if (message.includes(' yomama')) {
        yoMamaJoke();
    }
    else if (message.includes(' whatcanyoudo')) {
        whatCanYouDo();
    }
}

function yoMamaJoke() {
    axios.get('http://api.yomomma.info').then(res => {
        const joke = res.data.joke;

        const params = {
            icon_emoji: ':laughing:'
        };

        bot.postMessageToChannel('random', `Yo Mama: ${joke}`, params);
    });
}

function whatCanYouDo() {
    const params = {
        icon_emoji: ':question:'
    };

    bot.postMessageToChannel(
        'random',
        `nothing. im dumb`,
        params
    );
}

handleStandUpResponse = (event) => {
    console.log('isUserResponseToStandUp(event)', isUserResponseToStandUp(event))
    let timeStamp = new Date().getTime()
    let standUp = {timestamp: timeStamp, message: event.content}
    if(isUserResponseToStandUp(event)) {
        bot.postMessageToUser(user, `Thank you for your response! received: ${event.content} state: ${JSON.stringify(state)}`).always(function(data) {
            
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
    if(size >= questions.length){
        qToAsk = 'Thank you for your standup responses.  I will save it to the database now'
    } else {
        qToAsk = questions[size]
    }

    bot.postMessageToUser(user, qToAsk).always(function(data) {
        //console.log('user response data: ', data)
    })
}

startStandUp = () => {
    let qNum = 0
        bot.postMessageToUser(user, askStandupQuestion(qNum)).always(function(data) {
            //console.log('user response data: ', data)
        })
}

detectChannelId = (event) => {
    if(event.content === questions[0]) {
        return event.channel
    } else {
        return ''
    }
}