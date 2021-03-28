age = 20;
myName = "Jackie";
attributes = myName + ";" + age + ";" + (age + 0.5) + ";" + (0.5 - age);
pieces = attributes.split(';');
//console.log(`${typeof attributes}`);

for (i in pieces) {
    pieces[i] =
        `${pieces[i]} ${typeof pieces[i]}`;
}
console.log(pieces.join(","));