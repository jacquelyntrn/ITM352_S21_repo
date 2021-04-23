var express = require('express');
var app = express();
var myParser = require("body-parser");

app.use(myParser.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    //process login form POST and redirect to logged in page if ok, back to login page if not
    let username_entered = request.body["username"];
    let password_entered = request.body["password"];
    if(typeof user_data[username_entered] != 'undefined') {
          if(user_data[username_entered] ['password'] == password_entered) {
             response.send(`${username_entered} is logged in`);
          } else {
            response.redirect('/login');
          }
       } else {
          response.redirect('/register');
       }
    });

app.listen(8080, () => console.log(`listening on port 8080`));