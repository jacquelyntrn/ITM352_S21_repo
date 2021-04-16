var fs = require('fs');

var filename = "user_data.json";

console.log(data);

var user_data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
