var http        = require('http')
  , express     = require('express')
  , app         = express()
  , client      = require('mongodb').MongoClient
  , conn        = null;

// Open connection to database
client.connect("mongodb://localhost:27017/ptracker", function(err, db) {
    if(err) {
        return console.dir(err);
    }

    conn = db;
});

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
    var collection = conn.collection('posiciones');
    var pos;
    // var startDate = new Date();
    // var lastDay = 60 * 60 * 24;
    // startDate.setMilliseconds(startDate.getMilliseconds() - lastDay);

    collection.find().toArray(function(err, items) {
        for (var i = 0; i < items.length; i++) {
            console.log(items[i]);
        }

        res.render('map', {
            position: items
        });
    });

});

app.get('/*', function(req, res) {
    res.send('404 NOT FOUND.');
});

var port = 3000;

app.listen(port, function() {
    console.info('PTracker listening on port %s.', port.toString());
});

