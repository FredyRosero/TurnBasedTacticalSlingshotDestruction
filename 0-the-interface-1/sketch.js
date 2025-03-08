let ui = new UI();
function preload(){  
  ui.preload();
}

function setup() {  
  createCanvas(windowWidth, windowHeight,WEBGL);
  ui.setup();
  console.log("Hello, world!");  
}

function draw() {
  clear();
  ui.draw();
  drawBase();
  fill(0);
  noStroke();  
  textSize(16);
  textAlign(CENTER); 
  text("Hello, world!", 0, 0);  
  push();
  blendMode(SUBTRACT);
  strokeWeight(5);
  drawEllipse = (r,g,b,a,x,y) => {
    stroke(r,g,b,a);
    fill(r,g,b,a-200);
    ellipse(x, y, 150);
  }
  drawEllipse(255,0,0,255,-55,0);
  drawEllipse(0,255,0,255,55,0);
  drawEllipse(0,0,255,255,0,75);
  pop();
}

function mouseDragged() {
  ui.mouseDragged()
}

function mouseWheel(event) {
  ui.mouseWheel(event);
}

function mousePressed() {
  ui.mousePressed();
}

function mouseReleased() {
  ui.mouseReleased();
}
