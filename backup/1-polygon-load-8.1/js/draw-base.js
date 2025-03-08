function drawBase() {   
    clear(); 
    if (width < height) {
        background(0);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("Please rotate your device to landscape", width / 2, height / 2);
        return;
    }
    background(color('rgba(100%, 100%, 100%, 1)'));
}