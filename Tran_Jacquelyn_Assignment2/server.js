/*server function designed like Daniel Port's Lab14 and borrowed coding from Port_Kazman_Assignment2 for clarifications*/

var express = require('express');
var app = express();

var myParser = require("body-parser"); //parser package, needed for recieving and redirecting the POST
app.use(myParser.urlencoded({ extended: true }));

var fs = require('fs');
var qs = require('querystring');

var products = require('./products.json');
const { Script } = require('vm');

var user_quantity_data; //holds quantities from product selection

//borrowed from Lab14
var user_data_file = './user_data.json';
if (fs.existsSync(user_data_file)) {
   var file_stats = fs.statSync(user_data_file);
   var user_data = JSON.parse(fs.readFileSync(user_data_file, 'utf-8'));
} else {
   console.log(`${user_data_file} does not exist!`);
}

//code from Lab13
app.all('*', function (request, response, next) {
   console.log(request.method + ' to path ' + request.path);
   next();
});

app.get('/products', function (request, res, next) {
   res.json(products);
});

//changed to purchase because this code is verifying before going to login
app.get('/purchase', function (request, res, next) {
   user_quantity_data = request.query; // save for later
   if (typeof request.query['purchase_submit'] != 'undefined') {
      console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(request.query));

      user_quantity_data = request.query; // get the query string data which has the form data

      has_errors = false; //borrowed from example on Assignment1
      total_qty = 0; //need to check if something was selected so we will look if the total > 0
      for (i = 0; i < products.length; i++) { //checking each of the products through a loop
         if (user_quantity_data[`quantity${i}`] != 'undefined') { //if not undefined then move on to the next if statement
            a_qty = user_quantity_data[`quantity${i}`];
            total_qty += a_qty;
            if (!isNonNegInt(a_qty)) {
               has_errors = true; //invalid quantity
            }
         }
      }
      //if quantity is not valid, send them back to the store
      if (has_errors || total_qty == 0) {
         res.redirect('display.html?' + qs.stringify(user_quantity_data));
      } else { //if quantity is valid, send an invoice/login page
         res.redirect('login');
      }

   }
});

//borrowed from Lab14
/*made another app.get command to be more organized than putting the simple log in form in else. follows else after checking from store for valid quantities*/
app.get("/login", function (request, response) {
   if (typeof user_quantity_data != 'undefined') {
      //simple login form from server
      str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
<a href="register">Click here to register<a>
</body>
    `;
      response.send(str);
   } else {
      str = `
    <head>
    <script>
        alert('You need to select some products before logging in');
        
        window.location = './display.html';
    </script>
    </head>
        `;
      response.send(str);
   }
});

app.post("/login", function (request, response) {
   //process login form POST, looks for matching username and password
   let username_entered = request.body["username"];
   let password_entered = request.body["password"];
   if (typeof user_data[username_entered] != 'undefined') {
      if (user_data[username_entered]['password'] == password_entered) {
         user_quantity_data['username'] == username_entered;
         //response.send(`${username_entered} is logged in`);
         response.redirect('./invoice.html?' + qs.stringify(user_quantity_data));
      } else {
         //response.send(`${username_entered} password wrong`);
         response.redirect('/login');
      }
   } else {
      response.send(`${username_entered} not found`);
   }
});

app.get("/register", function (request, response) {
   if (typeof user_quantity_data != 'undefined') {
      //give a simple register form, borrowed from Lab14
      str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="Enter username" ><br />
<input type="password" name="password" size="40" placeholder="Enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="Enter password again"><br />
<input type="email" name="email" size="40" placeholder='Enter email "example@mail.com'><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
      response.send(str);
   } else {
      str = `
        <head>
        <script>
            alert('You need to select some products before registering!');
            
            window.location = './display.html';
        </script>
        </head>
            `;
      response.send(str);
   }
});

//add a new user to the database the json
app.post("/register", function (request, response) {
   username = request.body['username'];
   email = request.body['email'];

   var reg_errors = [];
   var user_errors = [];
   var pass_errors = [];
   var email_errors = [];

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

   //validate the user info before saving 
   //check is username taken
   if (reg_errors.length != 0) {//borrowed from Lab14
      user_data[username] = {};
      user_data[username].password = request.body['password'];//body requested must match the form
      user_data[username].password = request.body['repeat_password'];
      user_data[username].email = request.body['email'];
      fs.writeFileSync(user_data_file, JSON.stringify(user_data)); //upload new user to user_data
      console.log("Saved: " + user_data);
      user_quantity_data['username'] = username; //add the username to the data that will be sent to the invoice so the user can be identified with this transient data
      response.redirect('/invoice.html?' + qs.stringify(user_quantity_data)); //transient data passed to invoice in a query string, code borrowed from Rick Kazman. learning to understand transient data      
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

// helper functions
function isNonNegInt(q, return_errors = false) {
   errors = []; // assume no errors at first
   if (q == '') q = 0; // handle blank inputs as if they are 0
   if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // Check if string is a number value
   else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Check if it is non-negative
   else if (parseInt(q) != q) errors.push('<font color="red">Not an integer!</font>'); // Check that it is an integer
   return return_errors ? errors : (errors.length == 0);
}