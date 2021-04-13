/* 
Name: Eric Choy
Purpose: Hosting a server for assignment 2
*/

var querystring = require('querystring');
var express = require('express'); // Express package
var app = express();
var myParser = require("body-parser"); // Parser package
var products = require('./products.json');
const { request } = require('http');
var fs = require('fs');
var qs = require('querystring');
const { response, query } = require('express');

var input_quantities = []; // For users that inputted quantities for products


// Code from Lab13
app.all('*', function (request, response, next) {
   console.log(request.method + ' to path ' + request.path);
   next();
});

app.use(myParser.urlencoded({ extended: true }));

app.get("/process_page", function (request, response) {
   input_quantities = request.query // for User data
   // check if quantity data is valid
   params = request.query;
   console.log(params);
   if (typeof params['purchase_submit'] != 'undefined') {
      has_errors = false; // Borrowed from example on Assignment1
      total_qty = 0;
      for (i = 0; i < products.length; i++) { // Checking each of the products in the array
         if (typeof params[`quantity${i}`] != 'undefined') {  // If not undefined then move on to the next if statement
            a_qty = params[`quantity${i}`];
            total_qty += a_qty;
            if (!isNonNegInt(a_qty)) {
               has_errors = true; //oops, invalid quantity
            }
         }
      }
      console.log(has_errors, total_qty);
      qstr = querystring.stringify(request.query);
      if (has_errors || total_qty == 0) {
         // If quantity is not valid, send them back to the store
         qstr = querystring.stringify(request.query);
         response.redirect("store.html?" + qstr);
         // If quantity is valid, send an invoice/login page
      } else {
         response.redirect("login.html?" + qstr);
      }
   }
});

// Used code from Lab13
app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here

// Function isNonNegInt taken from Lab13
function isNonNegInt(stringToCheck, returnErrors = false) { // Checks whether the string is a valid integer
   errors = []; // assume no errors at first
   if (stringToCheck == "") stringToCheck = 0;
   if (Number(stringToCheck) != stringToCheck) errors.push('Not a number!'); // Check if string is a number value
   if (stringToCheck < 0) errors.push('Negative value!'); // Check if it is non-negative
   if (parseInt(stringToCheck) != stringToCheck) errors.push('Not an integer!'); // Check that it is an integer

   return returnErrors ? errors : (errors.length == 0);
}

// Borrowed from Lab14
var filename = "user_data.json";

if (fs.existsSync(filename)) {
   data = fs.readFileSync(filename, 'utf-8');

   user_data = JSON.parse(data);
   console.log("User_data =", user_data);
} else {
   console.log("Sorry can't read file " + filename);
   exit();
}

// Used base from Lab14
app.post("/login.html", function (request, response) {
   console.log(input_quantities); // Reports the user input in console
   var id_username = request.body.username;
   id_username = request.body.username.toLowerCase(); // Makes username case insensitive
   console.log("username = " + id_username) // Tells us what the username tbey inputted is
   if (typeof user_data[id_username] != 'undefined') {
      if (user_data[id_username].password == request.body.password) {
         quantityQstring = qs.stringify(input_quantities); // If the info is correct, make inputs a string
         response.redirect('/invoice.html?' + quantityQstring + `&username=${id_username}`)
      } else {
         error = "Invalid password";
      }
   } else {
      error = "Invalid username";
   }
   request.query.LoginError = error;   // In case of info errors, make the username sticky
   request.query.StickyLoginUser = id_username;
   qstring = querystring.stringify(request.query);
   response.redirect('/login.html?error=' + error);
});

app.post("/registration.html", function (request, response) {

   // Make case insensitive
   username = request.body.username.toLowerCase();
   email = request.body.email.toLowerCase();

   // Turns quantity object into a string
   quantityQstring = qs.stringify(input_quantities);

   // Variables for error messages
   var reg_errors = [];
   var name_errors = [];
   var user_errors = [];
   var pass_errors = [];
   var email_errors = [];

   // Full name error checks
   if (request.body.fullname > 30) { // Check to see if name is too long
      reg_errors.push("Name is too long. Please shorten below 30 characters.");
      name_errors.push("Name is too long. Please shorten below 30 characters.");
   }
   if ((/[a-zA-Z]+[ ]+[a-zA-Z]+/).test(request.body.fullname) == false) { // Another attempt from the reg expression stuff
      reg_errors.push("Only use letters and add one space between first & last name.");
      name_errors.push("Only use letters and add one space between first & last name.");
   }

   // Username error checks
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

   // Password error checks
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

   // Email error checks
   if (/^[a-zA-Z0-9._]+@[a-zA-Z.]+\.[a-zA-Z]{2,3}$/.test(email) == false) { // Looked online for help on this
      reg_errors.push("Email format is invalid.");
      email_errors.push("Email format is invalid.");
   }

   // Help from Lab14 code; puts in data if there are no errors
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