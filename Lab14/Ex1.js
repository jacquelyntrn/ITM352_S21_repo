var fs = require('fs');

var filename = "user_data.json";

data = fs.readFileSync(filename, 'utf-8')

console.log(data);

var users_reg_data  = JSON.parse(fs.readFileSync(filename, 'utf-8'));
