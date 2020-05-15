var express = require('express');
var app = express();
var $ = require('jquery');
app.use(express.static('public'));

var PORT = 3000;

// app.get('/', function(req, res) {
//     res.send('Hello!')
// });

app.listen(PORT, function() {
    console.log('Server is running on port:', PORT)
});

