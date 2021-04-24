username = 'newuser';
users_reg_data[username] = {};
reg_data[username].password = 'newpass';
reg_data[username].email = 'newuser@user.com';

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
    <form action="" method="POST">
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
 app.post('/login', function (request, response) {
    let username_entered = request.body["username"];
    let password_entered = request.body["password"];
    if(typeof user_data[username_entered] != 'undefined') {
          if(user_data[username_entered] ['password'] == password_entered) {
             response.send(`${username_entered} is logged in`);
          } else {
             response.send(`${username_entered} password wrong`);
          }
       } else {
          response.redirect('/register');
       }
    });
 
 app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
    <body>
    <form action="register" method="POST">
    <input type="text" name="username" size="40" placeholder="enter username" ><br />
    <input type="password" name="password" size="40" placeholder="enter password"><br />
    <input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
    <input type="email" name="email" size="40" placeholder="enter email"><br />
    <input type="submit" value="Submit" id="submit">
    </form>
    </body>
    `;
    response.send(str);});
 
 app.post('/register', function (request, response) {
    //add a new user to the database the json
    if (
    username = request.body['username'],
    user_data[username] = {},
    user_data[username].password = request.body['password'],
    user_data[username].password = request.body['repeat_password'],
    user_data[username].email = request.body['email']
    ) {
        fs.writeFileSync(ser_data_file, JSON.stringify(user_data));
        console.log("user_data[username] is registered.")
    } else {
        response.redirect('/register');
    }});