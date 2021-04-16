const querystring = require('querystring');
var express = require('express'); //express package
var app = express();

var myParser = require("body-parser"); //parser package, needed forrecieving and redirecting the POST
app.use(myParser.urlencoded({ extended: true }));

var products = require('./static/products_data.js');
var fs = require('fs');
var qs = require('querystring');
const { response, query } = require('express');

var input_qty = []; //for users that inputted quantities for products

//borrowed from Lab14
var user_data_file = './user_data.json';
if(fs.existsSync(user_data_file)) {
   var file_stats = fs.statSync(user_data_file);
   var user_data = JSON.parse(fs.readFileSync(user_data_file, 'utf-8'));
} else {console.log (`${user_data_file} does not exist!`);
}

//code from Lab13
app.all('*', function (request, response, next) {
   console.log(request.method + ' to path ' + request.path);
   next();
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

app.get("/login", function (request, response) {
   input_qty = request.query
   console.log(input_qty);
   if (typeof input_qty['purchase_submit'] != 'undefined') {
      has_errors = false; //borrowed from example on Assignment1
      total_qty = 0;
      for (i = 0; i < products.length; i++) { //checking each of the products in the array
         if (typeof input_qty[`quantity${i}`] != 'undefined') {  //if not undefined then move on to the next if statement
            a_qty = input_qty[`quantity${i}`];
            total_qty += a_qty;
            if (!isNonNegInt(a_qty)) {
               has_errors = true; //oops, invalid quantity
            }
         }
      }
      console.log(has_errors, total_qty);
      qstr = querystring.stringify(request.query);
      if (has_errors || total_qty == 0) {
         //if quantity is not valid, send them back to the store
         qstr = querystring.stringify(request.query);
         response.redirect("display.html?" + qstr);
         //if quantity is valid, send an invoice/login page
      } else {
   //give a simple login form
   str = `
   <body>
   <form action="process_login" method="POST">
   <input type="text" name="username" size="40" placeholder="enter username" ><br />
   <input type="password" name="password" size="40" placeholder="enter password"><br />
   <input type="submit" value="Submit" id="submit">
   </form>
   </body>
   `;
   response.send(str);
      }
   }   
});

//from Lab14
app.post('/process_login', function (request, response) {
   let username_entered = request.body["username"];
   let password_entered = request.body["password"];
   if(typeof user_data[username_entered] != 'undefined') {
         if(user_data[username_entered] ['password'] == password_entered) {
            response.send(`${username_entered} is logged in`);
         } else {
            response.send(`${username_entered} password wrong`);
         }
      } else {
         response.send(`${username_entered} not found`);
      }
   });

app.get("/register", function (request, response) {
   // Give a simple register form
   str = `
   <body>
   <form action="process_register" method="POST">
   <input type="text" name="username" size="40" placeholder="enter username" ><br />
   <input type="password" name="password" size="40" placeholder="enter password"><br />
   <input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
   <input type="email" name="email" size="40" placeholder="enter email"><br />
   <input type="submit" value="Submit" id="submit">
   </form>
   </body>
   `;
   response.send(str);});

app.post('/process_register', function (req, res) {
   //add a new user to the database the json
   username = req.body['username'];
   user_data[username] = {};
   user_data[username].password = req.body['password'];
   user_data[username].password = req.body['repeat_password'];
   user_data[username].email = req.body['email'];
   //upload new user to user_data
   fs.writeFileSync(ser_data_file, JSON.stringify(user_data));
});

//used code from Lab13
app.use(express.static('./static'));
var listener = app.listen(3000, () => { console.log('server started listening on port ' + listener.address().port) });