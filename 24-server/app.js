const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const cors = require('cors');

// cross origin stuff
const corsOptions = {
	origin: [ 'https://www.bsub.cl/24', 'https://www.bsub.cl', '*'],
  methods: [ 'GET', 'POST', 'OPTIONS' ],
  credentials: true,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
};

//app.options('*', cors(corsOptions));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

let topScores = [];

app.post('/api/getTop', function(req, res) {
  let { number } = req.body;
  if(!number) number = 10;
  let answer = [];
  for(let i = 0; i < Math.min(number, topScores.length); ++i) {
    answer.push(topScores[i].name + ": " + topScores[i].score);
  }
  res.send(answer);
});

app.post('/api/submitScore', function(req, res) {
  const { name, score } = req.body;
  console.log("name = " + name);
  console.log("score = " + score);
  topScores.push({ name, score });
  topScores.sort((a, b) => {return a.score - b.score});
  while(topScores.length > 50) {
    topScores.pop();
  }
  res.sendStatus(200);
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
