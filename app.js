var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');


app.use('/angular.js', express.static(__dirname + '/angular.js'));

app.use('/main.js', express.static(__dirname + '/main.js'));
app.use('/lodash.js', express.static(__dirname + '/lodash.js'));
app.use('/svgGraph.html', express.static(__dirname + '/svgGraph.html'));
app.use('/ajax-loader.gif', express.static(__dirname + '/ajax-loader.gif'));
app.use('/style.css', express.static(__dirname + '/style.css'));
app.use('/dropDowntemplate.html', express.static(__dirname + '/dropDowntemplate.html'));
app.use('/drpDowntemplate.html', express.static(__dirname + '/drpDowntemplate.html'));
app.use('/bootstrap.css', express.static(__dirname + '/bootstrap.css'));
app.use('/fonts/glyphicons-halflings-regular.woff2', express.static(__dirname + '/bootstrap/fonts/glyphicons-halflings-regular.woff2'));
app.use('/fonts/glyphicons-halflings-regular.woff', express.static(__dirname + '/bootstrap/fonts/glyphicons-halflings-regular.woff'));
app.use('/fonts/glyphicons-halflings-regular.ttf', express.static(__dirname + '/bootstrap/fonts/glyphicons-halflings-regular.ttf'));

app.use(bodyParser.json()); // for parsing application/json

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var randomIntFromInterval = function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

/*var requestFailed = false;*/

app.post('/getGraphData', function (req, res) {
    
    if (!req.body) return res.sendStatus(400);

    
    var x1,y1;
    var x0 = req.body.x0;
    var y0 = req.body.y0;
    var capacityY = req.body.capacityY;
    var x1min = req.body.x1min;
    
    x1 = randomIntFromInterval(x1min, x1min + 100); 
    y1 = randomIntFromInterval(0, capacityY); 
    
    var line = {x0: x0 , y0: y0 , x1: x1, y1: y1};
    
    
    /*if (!requestFailed) { // requests falls and then succeed again
        res.send(line);
        requestFailed = true;
    } else { 
        res.sendStatus(400);
        requestFailed = false;
    }*/
    res.send(line);
    
});

var statusMenuResponse;

app.post('/getMenuRequestData', function (req, res) {
    
    (statusMenuResponse) ? statusMenuResponse = false : statusMenuResponse = true;
    setTimeout(function() { 
        res.send(statusMenuResponse);
        
    },2000);

    
    
});

app.listen(3000, function () {
    console.log(`Server running`);
});