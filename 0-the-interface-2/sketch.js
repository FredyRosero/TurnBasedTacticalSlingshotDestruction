let ui = new UI();
let glslShader;
let strokeShader;

function preload(){  
  ui.preload();
  glslShader = loadShader('glsl/polygonVertexShader.vert', 'glsl/polygonFragmentShader.frag');
  console.log("preload shader:", glslShader);
}

function setup() {  
  createCanvas(windowWidth, windowHeight, WEBGL);
  strokeShader = baseStrokeShader().modify(polygonStrokeShader);
  gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST); 
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  ui.setup();
}

function draw() {
  clear();
  background(255);
  ui.draw();
  drawBase();
  fill(0);
  noStroke();  
  textSize(20);
  textAlign(CENTER); 
  text("This is a long balck text, how does it blend?", 0, 20);  
  resetShader();
  
  shader(glslShader);
  blendMode(BLEND);
  strokeWeight(5);
  let colorArray;
  drawEllipse = (r,g,b,a,x,y,z) => {
    push();
    translate(0,0,z);
    stroke(r,g,b,a);
    fill(r,g,b,a);
    colorArray = [r/255, g/255, b/255, a/255];
    console.log(z,colorArray);
    glslShader.setUniform("uColor", colorArray);
    ellipse(x, y, 150);
    pop();
  }
  drawEllipse(255,  0,  0,64,-55,  0, 1);
  drawEllipse(  0,255,  0,64, 55,  0, 2);
  drawEllipse(  0,  0,255,64,  0, 75, 3);
  
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
