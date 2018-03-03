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
var h, w, gameId;

// values for the grid calculations
var placeholderValue = -1;
var wallValue = -100;
var foodValue = 100;
var myBodyValue = -100;
var enemySmallerValue;
var enemyLargerValue = -100;
var enemyBodyValue;

// variables for snake
var currentDirection;

// Creates a grid to use that stores the "value" 
var ourGrid = [];

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game
  h = request.body.height;
  w = request.body.width;
  gameId = request.body.width;

  // Add w +2 columns to our grid. 
  for (let i = 0; i < w + 2; i++) {
    var column = [];
    // Add h + 2 rows to our column
    for (let j = 0; j < h + 2; j++) {
      column.push(placeholderValue);
    }
    ourGrid.push(column);
  }
  
// Assigns value of wall to the wall values
  for (let i = 0; i < w + 2; i++) {
    ourGrid[0][i] = wallValue;
    ourGrid[h+2][i] = wallValue;
  }

  
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
  var ourSnake = request.body.you;
  // array of our body points
  var ourBody = ourSnake.body.data;
  var ourHealth = ourSnake.health;
  var ourLength = ourSnake.length;
  // variable for the currentDirection

  // Turning: 
  // if next value is 0, make emergencyTurn
  // if next board is free
    // if otherSnake.size < thisSnake.size, otherSnake.head = value 0
        // if otherSnake is close to another food and thisSnake.size - otherSnake.head => 1
          // chase otherSnake  

  // look ahead left and right for gridsize/2 
    // turn in direction of farther safe  

  // emergencyTurn
    // if left is free
      // turn left 
    // else turn right  
  
    
  // Clears grid
  /
  
  // Assigns value of food to ourGrid
  
  // Assigns value
  
  // NOTE: Do something here to generate your move
  var moves = ['up','down','left','right'];
  var nextMove = moves[Math.floor(Math.random() * 4)];
  ///// AVOID WALLSSSS /////
  
  ///// AVOID SELF     /////

  ///// GET FOOD       /////

  ///// EAT SSNAKEss   /////

  console.log(nextMove);
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
  return true;
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
