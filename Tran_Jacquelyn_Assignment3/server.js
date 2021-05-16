/*majority of the code was borrowed from Labs 13 and 14. changed the design of the website to have a seperate login and register page instead of having it on the server. code for the registration check is credited to Eric Choy (github: @choyeric)*/

var querystring = require('querystring');
var express = require('express'); //express package
var app = express();
var myParser = require("body-parser"); //parser package, needed for recieving and redirecting the POST
const { request } = require('http');
var fs = require('fs');
var qs = require('querystring');
const { response, query } = require('express');

var session = require('express-session');
var products_data = require('./products.json');
var nodemailer = require('nodemailer');

var user_quantity_data = []; //holds quantities from product selection

//code from Lab 13
app.all('*', function (request, response, next) {
   // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
   // anytime it's used
   console.log(request.method + ' to path ' + request.path);
   if (typeof request.session.cart == 'undefined') { request.session.cart = {}; }
   next();
 });

app.use(myParser.urlencoded({ extended: true }));
app.use(session({secret: "ITM352 rocks!",resave: false, saveUninitialized: true}));

app.get("/get_products_data", function (request, response) {
   response.json(products_data);
 });
 
 app.get("/add_to_cart", function (request, response) {
   var products_key = request.query['products_key']; // get the product key sent from the form post
   var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
   request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
   response.redirect('./cart.html');
 });
 
 app.get("/get_cart", function (request, response) {
   response.json(request.session.cart);
 });
 
 app.get("/checkout", function (request, response) {
 // Generate HTML invoice string
   var invoice_str = `Thank you for your order!<table border><th>Quantity</th><th>Item</th>`;
   var shopping_cart = request.session.cart;
   for(product_key in products_data) {
     for(i=0; i<products_data[product_key].length; i++) {
         if(typeof shopping_cart[product_key] == 'undefined') continue;
         qty = shopping_cart[product_key][i];
         if(qty > 0) {
           invoice_str += `<tr><td>${qty}</td><td>${products_data[product_key][i].name}</td><tr>`;
         }
     }
 }
   invoice_str += '</table>';
 // Set up mail server. Only will work on UH Network due to security restrictions
   var transporter = nodemailer.createTransport({
     host: "mail.hawaii.edu",
     port: 25,
     secure: false, // use TLS
     tls: {
       // do not fail on invalid certs
       rejectUnauthorized: false
     }
   });
 
   var user_email = 'phoney@mt2015.com';
   var mailOptions = {
     from: 'phoney_store@bogus.com',
     to: user_email,
     subject: 'Your phoney invoice',
     html: invoice_str
   };
 
   transporter.sendMail(mailOptions, function(error, info){
     if (error) {
       invoice_str += '<br>There was an error and your invoice could not be emailed :(';
     } else {
       invoice_str += `<br>Your invoice was mailed to ${user_email}`;
     }
     response.send(invoice_str);
   });
 });


app.get("/purchase", function (request, response) {
   user_quantity_data = request.query //for user 
   //check if quantity data is valid
   params = request.query;//for input data
   console.log(params);
   if (typeof params['purchase_submit'] != 'undefined') {
      console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(params));
      has_errors = false; //from example Assignment1
      total_qty = 0;
      for (i = 0; i < products.length; i++) { //checking the product quantities into an array
         if (typeof params[`quantity${i}`] != 'undefined') {  //user doesn't want a certain product or 'undefined'
            a_qty = params[`quantity${i}`];
            total_qty += a_qty;
            if (!isNonNegInt(a_qty)) {
               has_errors = true; //invalid, error page on store
            }
         }
      }
      console.log(has_errors, total_qty);
      qStr = querystring.stringify(request.query);
      if (has_errors || total_qty == 0) {
         //warning invalid error on store
         qStr = querystring.stringify(request.query);
         response.redirect("store.html?" + qStr);
         //valid, goes to login first
      } else {
         response.redirect("login.html?" + qStr);
      }
   }
});

//code from Lab14
var filename = "user_data.json"; //filename of file holding user data

if (fs.existsSync(filename)) {
   data = fs.readFileSync(filename, 'utf-8');

   user_register_data = JSON.parse(data);
   console.log("user_register_data =", user_register_data);
} else {
   console.log("Sorry can't read file " + filename);
   exit();
}

//learned from class on Lab14
app.post("/login.html", function (request, response) {
   console.log(user_quantity_data); //can see user in console
   var username_entered = request.body.username;
   username_entered = request.body.username.toLowerCase(); //makes username case insensitive
   console.log("username = " + username_entered) //see in the console
   if (typeof user_register_data[username_entered] != 'undefined') {
      if (user_register_data[username_entered].password == request.body.password) {
         quantityQstring = qs.stringify(user_quantity_data); //make the information if correct into a string to be used in the next page
         response.redirect('/invoice.html?' + quantityQstring + `&username=${username_entered}`)
      } else {
         error = "Invalid password";
      }
   } else {
      error = "Invalid username";
   }
   request.query.LoginError = error;   //sticky test with the username
   request.query.StickyLoginUser = username_entered;
   qString = querystring.stringify(request.query);
   response.redirect('/login.html?error=' + error);
});

app.post("/registration.html", function (request, response) {
   // Make case insensitive
   username = request.body.username.toLowerCase();
   email = request.body.email.toLowerCase();

   // Turns quantity object into a string
   quantityQstring = qs.stringify(user_quantity_data);

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
   if (typeof user_register_data[username] != 'undefined') {
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
      user_register_data[username] = {};
      user_register_data[username].fullname = POST["fullname"];
      user_register_data[username].password = POST["password"];
      user_register_data[username].email = POST["email"];

      fs.writeFileSync(filename, JSON.stringify(user_register_data)); //saves/writes registaration data into the user_register_data json file
      console.log("Saved: " + user_register_data);
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
app.use(express.static(__dirname + '/static'));//dirname is directory name
var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });

//helper functions
function isNonNegInt(q, return_errors = false) {
   errors = []; // assume no errors at first
   if (q == '') q = 0; // handle blank inputs as if they are 0
   if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // Check if string is a number value
   else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Check if it is non-negative
   else if (parseInt(q) != q) errors.push('<font color="red">Not an integer!</font>'); // Check that it is an integer
   return return_errors ? errors : (errors.length == 0);
}