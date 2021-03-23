age = 20;
myname = "Jackie";
attributes = myname + ";" + age + ";" + (age + 0.5) + ";" + (0.5 - age);
pieces = attributes.split(';');

function isNonNegInt (q, returnErrors=false) {
errors = []; // assume no errors at first
if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

return returnErrors ? errors : (errors.length == 0) //returns an array of all the errors
}

function checkNum(item, index) {
    returnErrors = isNonNegInt(item, true).join(" ");
    if (returnErrors.length == 0) {
        console.log("\'" + item + "' is valid");
    } else {
    console.log("'" + item + "' is " + returnErrors);
    }
}

pieces.forEach(checkNum);

console.log(pieces)

for (i in pieces) {
    console.log (isNonNegInt (pieces[i]));
}

//console.log (isNonNegInt('20'));
/*isNonNegInt('-1');
isNonNegInt('.19');
isNonNegInt('word');*/