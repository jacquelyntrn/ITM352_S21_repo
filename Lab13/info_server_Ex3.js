var express = require('express');
const QueryString = require('qs');

var app = express();
var myParser = require("body-parser");

//the asterick can mean anything that is in the same format
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();//go on to the next route
});

app.use(myParser.urlencoded({ extended: true }));

app.get('/hello.txt', function (request, response, next) {
    response.send(request.method + ' to path ' + request.path + ` with query` + JSON.stringify(QueryString));
});

app.post('/display', function (request, response, next) {//if you get a post method on this file, process this function
    user_data = {'username': 'nameTest', 'password':'passTest'}//doing validation on the server
    post_data = request.body;
        if (post_data['quantity_textbox']) {
            the_qty = post_data ['quantity_textbox'];
            if (isNonNegInt (the_qty)){
                response.send ('Thanks');
                return;
            } else {
                response.redirect('./order_page.html?quantity_textbox='+the_qty); //if there is an invalid error, then it'll keep the user on the same page
            }
    }
    response.send(post_data);
});//check if the data is matching to the data on the server

app.listen(8080, function () {
    console.log(`listening on port 8080`)
}); //looks for a server

app.use(express.static('./public'));//sets up a static web server
//note the use of an anonymous function here

//use nodemon, similar to live server and will automatically restart your server
//server is the only thing that has access to all the users and the passwords. it must be validated there. it also helps direct where the user should go depending on if the data is valid or invalid.

function isNonNegInt(q, returnErrors = false) {
    if (q == '') q = 0;
    errors = []; // assume no errors at first
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    return returnErrors ? errors : (errors.length == 0) //Returns an array of all the errors
}