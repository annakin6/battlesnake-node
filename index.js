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
var placeholderValue = 0;
var wallValue = -100;
var foodValue = 90;
var bodyValue = -100;
var enemySmallerValue = 100;
var enemyLargerValue = -100;
var taunts = [
  "Yousa thinking yousa people ganna die?",
  "I don’t care what universe you’re from, that’s got to hurt!",
   "Love won’t save you, Padme. Only my new powers can do that.",
  "…Don’t try it, Anakin. I have the high ground!",
  "There’s always a bigger fish.",
  "I’m haunted by the kiss that you should never have given me.",
  "Are you an angel?",
  "I don’t like sand. It’s coarse and rough and irritating and it gets everywhere.",
  "Ye gods, whatta meesa sayin’?",
   "I sense Count Dooku.",
  "Ani? My goodness, you’ve grown!",
  "How wude!",
  "I can’t take Dooku alone! I need you!",
  "I’ve been wondering… what are midi-chlorians?",
  "Chesco, Sebulba. Chipoka oomen geesa. Me teesa radical fbombati chop chawa.",
  "I have the POWER! UNLIMITED… POWER!",
  "Droidekas!",
  "Uh! So uncivilized.",
  "Now this is pod racing!",
  "So this is how liberty dies… with thunderous applause.",
  "…It is only natural. He cut off your arm, and you wanted revenge.",
  "Always two there are, no more, no less.",
  "Mom, you said that the biggest problem in the universe is no one helps each other.",
  "He owes me what you’d call a ‘life-debt.’ Your gods demand that his life belongs to me.",
  "From my point of view, the Jedi are evil!",
  "I thought we had decided not to fall in love. That we’d be forced to live a lie and that it would destroy our lives.",
  "A vergence, you say?",
  "Now that I’m with you again, I’m in agony. My heart is beating, hoping that that kiss will not become a scar.",
  "No loose wire jokes.",
  "Your mother had gone out early, like she always did, to pick mushrooms that grow on the vaporators.",
  "For reasons we can’t explain, we are losing her.",
  "…Well, then you really are lost!",
  "He said… you killed younglings!",
  "What if the democracy we thought we were serving no longer exists, and the Republic has become the very evil we have been fighting to destroy?",
  "I have waited a long time for this moment, my little green friend.",
  "…I’ll try spinning. That’s a good trick. Whoa-ah!",
  "Train yourself to let go… of everything you fear to lose.",
  "There was no father. I carried him, I gave birth, I raised him. I can’t explain what happened.",
  "You were banished because you were clumsy?",
  "You are in my very soul, tormenting me…",
  "…We used to come here for school retreat. We would swim to that island every day. I love the water. We used to lie out on the sand and let the sun dry us and try to guess the names of the birds singing.",
  "At an end your rule is, and not short enough was it.",
  "Ray shields!",
  "Just being around her again is… intoxicating.",
  "Your new Empire?",
  "Symbionts?",
  "They live inside me?",
  "I don’t understand.",
  "Your presence is soothing.",
  "…We live in a real world, come back to it. You’re studying to become a Jedi, I’m… I’m a senator."
]

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
    if(ourGrid[i+1][1] != null) {
      ourGrid[i+1][1] = wallValue / 2;
    }
    ourGrid[i][h+1] = wallValue;
    if(ourGrid[i+1][h] != null) {
      ourGrid[i+1][h] = wallValue / 2;
    }
  }
  for (let i = 0; i < h + 2; i++) {
    ourGrid[0][i] = wallValue;
    if(ourGrid[1][i+1] != null) {
      ourGrid[1][i+1] = wallValue / 2;
    } 
    ourGrid[w+1][i] = wallValue;
    if(ourGrid[w][i+1] != null) {
      ourGrid[w][i+1] = wallValue / 2;
    } 
  }
  
  // Response data
  const data = {
    "color": "#FFF",
    "secondary_color": "#E92693",
    "head_url": "http://placecage.com/c/100/100",
    "taunt": "snek",
    "head_type": "tongue",
    "tail_type": "round-bum"
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
      // Assigns value of their snake head to the grid, based on size of snake
      if(snakes[i].length < ourSnake.length) {
        ourGrid[snakes[i].body.data[0].x + 1][snakes[i].body.data[0].y + 1] = enemySmallerValue;
      } else {
        ourGrid[snakes[i].body.data[0].x + 1][snakes[i].body.data[0].y + 1] = enemyLargerValue;
      }
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
    taunt: taunts[Math.floor(Math.random() * taunts.length)], // optional, but encouraged!
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