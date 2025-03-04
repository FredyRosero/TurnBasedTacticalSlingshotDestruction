function drawBaseCanvas() {
    background(240);
    if (width < height) {
        background(0);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("Please rotate your device to landscape", width / 2, height / 2);
        return;
    }
}