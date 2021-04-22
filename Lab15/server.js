const querystring = require('querystring');
var express = require('express'); //express package
var app = express();

var myParser = require("body-parser"); //parser package, needed forrecieving and redirecting the POST
app.use(myParser.urlencoded({ extended: true }));

var products = require('./static/products_data.js');
var fs = require('fs');
var qs = require('querystring');
const { response, query } = require('express');

var saved_quantity = []; //for users that inputted quantities for products

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session'); //session is data being associated with a user with their id
app.use(session({secret: "ITM352 rocks!"})); //encryption key


//code from Lab13
app.all('*', function (request, response, next) {
   console.log(req);
   console.log(request.method + ' to path ' + request.path);
   next();
});

//cookies for Lab15, ex1
app.get('/set_cookie', function (request, response, next) {
   let my_name = 'Jackie';
   response.cookie('my_name', my_name, {expire: 5000 + Date.now()});
   now = new Date();
   response.send('Cookie for ${my_name} sent');
   next();
});

app.get('/use_cookie', function (request, response, next) {  
   if(typeof request.cookie["my_name"] !='undefined') {
      response.send('Cookie for ${request.cookie["my_name"]} sent');
   } else {
      response.send('Name was not found')
   }
   next ();
});

//sessions, ex2
app.get('/use_session', function (request, response, next) {
   response.send('welcome, your session ID is ${request.session.id}');
   next();
});

//borrowed from Lab14
var user_data_file = './user_data.json';
if(fs.existsSync(user_data_file)) {
   var file_stats = fs.statSync(user_data_file);
   var user_data = JSON.parse(fs.readFileSync(user_data_file, 'utf-8'));
} else {console.log (`${user_data_file} does not exist!`);
}

app.get("/login", function (request, response) {
   saved_quantity = request.query
   console.log(saved_quantity);
   if (typeof saved_quantity['purchase_submit'] != 'undefined') {
      has_errors = false; //borrowed from example on Assignment1
      total_qty = 0;
      for (i = 0; i < products.length; i++) { //checking each of the products in the array
         if (typeof saved_quantity[`quantity${i}`] != 'undefined') {  //if not undefined then move on to the next if statement
            a_qty = saved_quantity[`quantity${i}`];
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
   if(typeof request.session['last_login'] != 'undefined') {//Lab15, ex2
      console.log('Last login time was' + request.session['last_login']);
   } else {
      console.log("First time login");
   }
      request.session['last_login'] = Date();
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

app.post('/process_register', function (request, response) {
   //add a new user to the database the json
   username = request.body['username'];
   user_data[username] = {};
   user_data[username].password = request.body['password'];
   user_data[username].password = request.body['repeat_password'];
   user_data[username].email = request.body['email'];
   //upload new user to user_data
   fs.writeFileSync(ser_data_file, JSON.stringify(user_data));
});

//used code from Lab13
app.use(express.static('./static'));
var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });

// helper functions
function isNonNegInt(q, return_errors = false) {
   errors = []; // assume no errors at first
   if (q == '') q = 0; // handle blank inputs as if they are 0
   if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // Check if string is a number value
   else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Check if it is non-negative
   else if (parseInt(q) != q) errors.push('<font color="red">Not an integer!</font>'); // Check that it is an integer
   return return_errors ? errors : (errors.length == 0);
}