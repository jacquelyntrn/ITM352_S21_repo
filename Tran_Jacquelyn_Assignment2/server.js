const querystring = require('querystring');
var express = require('express'); //express package
var app = express();
var myParser = require("body-parser"); //parser package
var products = require('./static/products_data.js');
var fs = require('fs');
var qs = require('querystring');
const { response, query } = require('express');

var input_quantities = []; //for users that inputted quantities for products


//code from Lab13
app.all('*', function (request, response, next) {
   console.log(request.method + ' to path ' + request.path);
   next();
});

app.use(myParser.urlencoded({ extended: true }));

app.post("/process_page", function (request, response, next) {
   let POST = request.body;
    if (typeof POST['purchase_submit'] != 'undefined') { //reply undefined if info does not match 
        var has_valid_qtys = true; //assumes that quantity is invalid 
        var has_qtys = false; //assumes that quantity is valid
        //create a loop to ensure quantities are valid
        for (var i = 0; i < products.length; i++) {
            var qty = POST[`quantity${i}`];
            has_qtys = has_qtys || qty > 0
            has_valid_qtys = has_valid_qtys && isNonNegInt(qty);
        }
        //if qtys are good, create an invoice 
        const stringified = querystring.stringify(POST);
        if (has_valid_qtys && has_qtys) {
            //redirect to login
            response.redirect("./login.html?" + stringified);
            return; //stops the function 
        } else {
            //if not ready, go back to order page 
            response.redirect("./display.html?" + stringified);
        }
    }
});

//function isNonNegInt taken from Lab13
function isNonNegInt(stringToCheck, returnErrors = false) { //checks whether the string is a valid integer
   errors = []; //assume no errors at first
   if (stringToCheck == "") stringToCheck = 0;
   if (Number(stringToCheck) != stringToCheck) errors.push('Not a number!');
   if (stringToCheck < 0) errors.push('Negative value!');
   if (parseInt(stringToCheck) != stringToCheck) errors.push('Not an integer!');

   return returnErrors ? errors : (errors.length == 0);
}

//borrowed from Lab14
var filename = "user_data.json";

if (fs.existsSync(filename)) {
   data = fs.readFileSync(filename, 'utf-8');

   user_data = JSON.parse(data);
   console.log("User_data =", user_data);
} else {
   console.log("Sorry can't read file " + filename);
   exit();
}

//used base from Lab14
app.post("/login.html", function (request, response) {
   console.log(input_quantities); //reports the user input in console
   var id_username = request.body.username;
   id_username = request.body.username.toLowerCase(); //makes username case insensitive
   console.log("username = " + id_username) //tells us what the username tbey inputted is
   if (typeof user_data[id_username] != 'undefined') {
      if (user_data[id_username].password == request.body.password) {
         quantityQstring = qs.stringify(input_quantities); //if the info is correct, make inputs a string
         response.redirect('/invoice.html?' + quantityQstring + `&username=${id_username}`)
      } else {
         error = "Invalid password";
      }
   } else {
      error = "Invalid username";
   }
   request.query.LoginError = error;   //in case of info errors, make the username sticky
   request.query.StickyLoginUser = id_username;
   qstring = querystring.stringify(request.query);
   response.redirect('/login.html?error=' + error);
});

app.post("/registration.html", function (request, response) {

   //make case insensitive
   username = request.body.username.toLowerCase();
   email = request.body.email.toLowerCase();

   //turns quantity object into a string
   quantityQstring = qs.stringify(input_quantities);

   //variables for error messages
   var reg_errors = [];
   var name_errors = [];
   var user_errors = [];
   var pass_errors = [];
   var email_errors = [];

   //full name error checks
   if (request.body.fullname > 30) { //check to see if name is too long
      reg_errors.push("Name is too long. Please shorten below 30 characters.");
      name_errors.push("Name is too long. Please shorten below 30 characters.");
   }
   if ((/[a-zA-Z]+[ ]+[a-zA-Z]+/).test(request.body.fullname) == false) { //another attempt from the reg expression stuff
      reg_errors.push("Only use letters and add one space between first & last name.");
      name_errors.push("Only use letters and add one space between first & last name.");
   }

   //username error checks
   if (typeof user_data[username] != 'undefined') {
      reg_errors.push("Username already in use.");
      user_errors.push("Username already in use.");
   }
   if (username.length < 4) {
      reg_errors.push("Usernames must be at least 4 characters long.");
      user_errors.push("Usernames must be at least 4 characters long.");
   }
   if (username.length > 10) {
      reg_errors.push("Usernames can only have up to 10 characters.");
      user_errors.push("Usernames can only have up to 10 characters.");
   }
   if ((/^[0-9a-zA-Z]+$/).test(username) == false) {
      reg_errors.push("Usernames may only have letters or numbers.");
      user_errors.push("Usernames may only have letters or numbers.");
   }

   //password error checks
   var fPass = request.body.password;
   var cPass = request.body.repeat_password;

   if (request.body.password.length < 6) {
      reg_errors.push("Password must be at least 6 characters long.");
      pass_errors.push("Password must be at least 6 characters long.");
   }
   if (request.body.password != request.body.repeat_password) {
      reg_errors.push("Passwords do not match.");
      pass_errors.push("Passwords do not match.");
   }

   //email error checks
   if (/^[a-zA-Z0-9._]+@[a-zA-Z.]+\.[a-zA-Z]{2,3}$/.test(email) == false) { // Looked online for help on this
      reg_errors.push("Email format is invalid.");
      email_errors.push("Email format is invalid.");
   }

   //help from Lab14 code; puts in data if there are no errors
   if (reg_errors.length == 0) {
      POST = request.body;
      username = POST["username"];
      user_data[username] = {};
      user_data[username].fullname = POST["fullname"];
      user_data[username].password = POST["password"];
      user_data[username].email = POST["email"];

      fs.writeFileSync(filename, JSON.stringify(user_data)); //saves/writes registaration data into the user_data json file
      quantityQstring = qs.stringify(input_quantities); //turns quantity object into a string
      response.redirect("/invoice.html?" + quantityQstring + `&username=${username}`); //if all good, send to invoice
   }

   if (reg_errors.length != 0) {
      request.query.fullname = request.body.fullname;
      request.query.username = request.body.username;
      request.query.password = request.body.password;
      request.query.repeat_password = request.body.repeat_password;
      request.query.email = request.body.email;
      response.redirect('./registration.html');
   }
});

//used code from Lab13
app.use(express.static('./static'));
var listener = app.listen(3000, () => { console.log('server started listening on port ' + listener.address().port) });