attributes1  =  "Jackie;19;ACC";
attributes2  =  "Jackie;20;20.5;19.5";
//info = attributes.split(';');
//console.log (info);

function myName (pieces) {
    return pieces.split(';');
}

console.log (myName(attributes2));

for (i = 0; i < 3; i++) {
    console.log(pieces[i]);
}