var fs = require('fs');

var filename = "user_data.json";

console.log(data);

var users_reg_data  = JSON.parse(fs.readFileSync(filename, 'utf-8'));
