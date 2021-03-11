// Robot moving sim thing
// Randomly moves around the box
// You're welcome whoever is reading this
while (0 < 1) {
    var x = Math.floor((Math.random() * 10) + 1);

    if (x < 7) {
        controller.move();
    }
    else {
        controller.rotate();
    }
}