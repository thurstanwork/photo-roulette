var express = require('express');
var app = express();

// Location of static files
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.get('/slqtest', function (request, response) {
  response.sendFile(__dirname + '/views/slqtest.html');
});
// Get config data and add api key from .env

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
