'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })

module.exports.saveUserStandupResponse = function (event, context, callback) {
  console.log('full event event.body.records', event.body.records)
  console.log('full event event.body.records json parse', JSON.parse(event.body).records)
  if (!event.body || !JSON.parse(event.body).records) {
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*' // Required for CORS support to work
      },
      statusCode: 500,
      body: 'payload has no data.'
    }
    callback(null, response)
  }

  let recordList = JSON.parse(event.body).records
  console.log('recordList[0].name', recordList[0].name)
  for (let record of recordList) {
    console.log('record.serviceName', record.serviceName)
    let params = {
      Item: record,
      TableName: 'slackbot'
    }

    console.log('params', params)

    try {
      dynamoDb.put(params, function (err, data) {
        if (err) {
          callback(err, null)
        } else {
          const response = {
            headers: {
              'Access-Control-Allow-Origin': '*' // Required for CORS support to work
            },
            statusCode: 200,
            body: JSON.stringify({ message: `message saved.`, error: false })
          }
          callback(null, response)
        }
      })
    } catch (e) {
      callback(e, null)
    }
  }
}
