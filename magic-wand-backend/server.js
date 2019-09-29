const express = require('express');
const app = express();
app.use(express.json())
app.use(express.static('public'));

var oldDate
var date = oldDate = new Date().toLocaleString()
var accelerometerValues = {}

app.get('/getNewAction', function(request, response) {
  if (oldDate != date) {
    response.send(accelerometerValues)
  }
  else {
    response.send(false)
  }
  oldDate = date
});

app.get('/alive', function(request, response) {
  console.log('Still Alive')
  response.send(true)
});

app.post('/', function(request, response) {
  console.log(accelerometerValues)
  accelerometerValues = request.body
  console.log(accelerometerValues)
  date = new Date().toLocaleString()
  response.send(true)
});


// listen for requests :)
const listener = app.listen(4500)
