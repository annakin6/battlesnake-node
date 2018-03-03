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
var bodyValue = -100;
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
    ourGrid[i][0] = wallValue;
    ourGrid[i][h+1] = wallValue;
  }
  for (let i = 0; i < h + 2; i++) {
    ourGrid[0][i] = wallValue;
    ourGrid[w+1][i] = wallValue;
  }
  
  // Response data
  const data = {
    "color": "#FFF",
    "secondary_color": "#E92693",
    "head_url": "http://placecage.com/c/100/100",
    "taunt": "snek",
    "head_type": "tongue",
    "tail_type": "pixel"
  }

  return response.json(data)
})

function updateGrid(snakes, food, ourSnake) {
  console.log('In updateGrid: Entered function');
  // Clears grid
  for (let i = 1; i < w + 1; i++) {
    for (let j = 1; j < h + 1; j++) {
      ourGrid[i][j] = placeholderValue;
    }
  }
  console.log("After grid clearing");
  
  // Assigns value of our snakebody and their snake body to the grid
  for (let i = 0; i < snakes.length; i++) {
    for (let j = 0; j < snakes[i].body.data.length; j++) {
      ourGrid[snakes[i].body.data[j].x + 1][snakes[i].body.data[j].y + 1] = bodyValue;
    }
    console.log("after setting body values");
    if (snakes[i].id != ourSnake.id) {
      // Assigns value of their snake head to the grid
      ourGrid[snakes[i].body.data[0].x + 1][snakes[i].body.data[0].y + 1] = enemySmallerValue;
    }
    console.log("after setting head value");
  }
  console.log("after snakes for loop");  
  // Assigns value of food to ourGrid to 
  for (let i = 0; i < food.length; i++) {
    ourGrid[food[i].x + 1][food[i].y + 1] = foodValue;  
    console.log("after setting food value");
  }
  console.log('In updateGrid: Grid updated');
}

function getNextMove(headPos) {
  console.log("TOP OF GETNEXTMOVE");
  var moveVals = [{"val": ourGrid[headPos.x + 1 + 1][headPos.y + 0 + 1], "move": 'right'},
                  {"val": ourGrid[headPos.x + 0 + 1][headPos.y - 1 + 1], "move": 'up'},
                  {"val": ourGrid[headPos.x - 1 + 1][headPos.y + 0 + 1], "move": 'left'}, 
                  {"val": ourGrid[headPos.x - 0 + 1][headPos.y + 1 + 1], "move": 'down'}];
  var maxVal = wallValue;
  var bestMove = 'down';
  for (let i = 0; i < moveVals.length; i++) {
    if (moveVals[i].val > maxVal) {
      bestMove = moveVals[i].move;
      maxVal = moveVals[i].val;
    }
  }
  // Math.max(ourGrid[headPos.x + 1 + 1][headPos.y + 0 + 1],  // right
  //          ourGrid[headPos.x + 0 + 1][headPos.y + 1 + 1],  // up
  //          ourGrid[headPos.x - 1 + 1][headPos.y + 0 + 1],  // left
  //          ourGrid[headPos.x - 0 + 1][headPos.y - 1 + 1]) // down
  console.log('In getNextMove: ' + bestMove);
  return bestMove;
}

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  var ourSnake = request.body.you;
  var ourBody = ourSnake.body.data; // array of our body points
  var ourHealth = ourSnake.health;
  var ourLength = ourSnake.length;
  var snakes = request.body.snakes.data;
  var food = request.body.food.data;

  console.log("Our id: " + ourSnake.id);
  console.log(ourBody);
  console.log(snakes);
  
  // Turning: 
  // if next value is 0, make emergencyTurn
  // if next board is free
    // if otherSnake.size < thisSnake.size, otherSnake.head = value 0
        // if otherSnake is close to another food and thisSnake.size - otherSnake.head => 1
          // chase otherSnake  

  // look ahead left and right for gridsize/2 
    // turn in direction of farther safe
  updateGrid(snakes, food, ourSnake);
  
  // NOTE: Do something here to generate your move
  // var moves = ['up','down','left','right'];
  // var nextMove = moves[Math.floor(Math.random() * 4)];
  var nextMove = getNextMove(ourBody[0]);
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
  console.log(request.body.dead_snakes.data[0].death.causes);
  return response.json();
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})