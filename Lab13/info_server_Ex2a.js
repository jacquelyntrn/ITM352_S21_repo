/*var express = require('express');
const QueryString = require('qs');

var app = express();

//the asterick can mean anything that is in the same format
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.get('/test', function (request, response, next) {
    response.send(request.method + ' to path ' + request.path + ` with query` + JSON.stringify(QueryString));
});

app.listen8080, function() {
    console.log(`listening on port 8080`)
};

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here

//use nodemon, similar to live server and will automatically restart your server.*/