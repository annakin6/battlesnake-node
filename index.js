const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    "color": "#FF0000",
    "secondary_color": "#00FF00",
    "head_url": "http://placecage.com/c/100/100",
    "taunt": "snek",
    "head_type": "tongue",
    "tail_type": "pixel"
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  var nextMove = 'left';
  ///// AVOID WALLSSSS /////
  console.log(request.you);
  ///// AVOID SELF     /////

  ///// GET FOOD       /////

  ///// EAT SSNAKEss   /////



  // Response data
  const data = {
    move: nextMove, // one of: ['up','down','left','right']
    taunt: 'Outta my way, snake!', // optional, but encouraged!
  }

  return response.json(data)
})

// Handle POST request to '/end'
app.post('/end', (request, response) => {
  // NOTE: Do something when game ends

})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
