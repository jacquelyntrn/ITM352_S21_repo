const e = require('express');
var fs = require('fs');

var filename = "user_data.json";

if (fs.existsSync(filename)) {
    fileStats = fs.statSync(filename);
    console.log(filename + ' has ' + fileStats.size + ' characters.');

    users_reg_data  = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    console.log("users_reg_data =", users_reg_data);
} else {
    console.log("Sorry cannot read" + filename);
}


