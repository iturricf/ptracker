var net     = require('net')
  , cliente = require('mongodb').MongoClient;
//  , conn    = require('./connection.js');

cliente.connect("mongodb://localhost:27017/ptracker", function(err, db) {
    if (err) {
        return console.dir(err);
    }

    conn = db;
});

var server = net.createServer(function(socket) {

    var connection = conn;

    socket.setEncoding('ascii');
    socket.on('data', function(msg) {
        console.log('M: ' + msg);

        var parts = msg.split("#");

        // @TODO: Parse position data
        var pos = extractPositionData(msg);

        // @TODO: Save to mongodb
        var collection = connection.collection('posiciones');
        collection.insert(pos, function (err, result) {
            if (!err) {
                console.log('Position saved! :)');
            }
        });
    });
});

function extractPositionData(data) {
    var parts = data.split("#");
    var posData = parts[8].split(",");

    var position = {
        lng: posData[0],
        lngPole: posData[1],
        lat: posData[2],
        latPole: posData[3],
        speed: posData[4],
        heading: posData[5]
    };

    var datetime = {
        date: parts[9],
        time: parts[10],
    };

    // @TODO: Parse date & time
    convertToGmapCoordinates(position);
    var date = formatDateAndTime(datetime);

    console.log("Decimal Degree pos2: " + position.lat + " ; " + position.lng);
    console.log("Date is: " + date);

    position.date = date;

    return position;
}

function convertToGmapCoordinates(position) {
    var min = (position.lat.slice((position.lat.indexOf(".")) - 2) / 60);
    var deg = parseInt(position.lat.slice(0, (position.lat.indexOf(".") - 2)), 10);

    var lat = (position.latPole.toUpperCase() == 'S') ? ((deg + min) * -1) : (deg + min);

    min = (position.lng.slice((position.lng.indexOf(".")) - 2) / 60);
    deg = parseInt(position.lng.slice(0, (position.lng.indexOf(".") - 2)), 10);

    var lng = (position.lngPole.toUpperCase() == 'W') ? ((deg + min) * -1) : (deg + min);

    position.lat = lat;
    position.lng = lng;
}

function formatDateAndTime(datetime) {
    var date = {
        day: parseInt(datetime.date.substr(0, 2), 10),
        month: parseInt(datetime.date.substr(2, 2), 10),
        year: parseInt(datetime.date.substr(4, 2), 10)
    };

    date.year = ((date.year < 70) ? 2000 : 1900) + date.year;

    var time = {
        hours: parseInt(datetime.time.substr(0, 2), 10),
        minutes: parseInt(datetime.time.substr(2, 2), 10),
        seconds: parseInt(datetime.time.substr(4, 2), 10)
    };

    console.log('Date is: ' + date.day + '/' + date.month + '/' + date.year);
    console.log('Time is: ' + time.hours + ':' + time.minutes + ':' + time.seconds);

    return new Date(date.year, date.month - 1, date.day, time.hours, time.minutes, time.seconds);
}

server.listen(27488);