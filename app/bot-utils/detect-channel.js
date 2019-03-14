const questions = require('../../constant')

module.exports = (event) => {
  if (event.content === questions[0]) {
    return event.channel
  } else {
    return ''
  }
}
