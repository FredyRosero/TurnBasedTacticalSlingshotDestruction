```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\index.html
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Between the shaders</title>
  <script src="lib/p5.js"></script>
  <script type="application/javascript" src="//cdn.rawgit.com/Alorel/console-log-html/master/console-log-html.min.js"></script>
  <script src="glsl/polygonStrokeShader.js"></script>
  <script src="js/ui.class.js?v1"></script>
  <script src="js/setup-base.js"></script>
  <script src="js/draw-base.js"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto&display=swap">
  <link rel="stylesheet" type="text/css" href="style.css">
  <link rel="stylesheet" type="text/css" href="css/console.css">
</head>

<body>
  <main>
  </main>
  <ul id="myULContainer"></ul> <!-- I will hold the log messages -->
</body>
<script> 
  ConsoleLogHTML.connect(document.getElementById("myULContainer")); // Redirect log messages 
  //ConsoleLogHTML.disconnect(); // Stop redirecting 
  var myULContainer = document.getElementById("myULContainer");
  myULContainer.scrollTop = myULContainer.scrollHeight;
  var observer = new MutationObserver(function() {
    myULContainer.scrollTop = myULContainer.scrollHeight;
  });
  observer.observe(myULContainer, { childList: true });
</script>
<script src="sketch.js"></script>

</html>
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\sketch.js
let ui = new UI();
let glslShader;
let strokeShader;

function preload(){  
  ui.preload();
  glslShader = loadShader('glsl/polygonVertexShader.vert', 'glsl/polygonFragmentShader.frag');
  console.log("preload shader:", glslShader);
}

function setup() {  
  createCanvas(windowWidth, windowHeight,WEBGL);
  strokeShader = baseStrokeShader().modify(polygonStrokeShader);
  gl = this._renderer.GL;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  ui.setup();
}

function draw() {
  clear();
  ui.draw();
  drawBase();
  fill(0);
  noStroke();  
  textSize(20);
  textAlign(CENTER); 
  text("This is a long balck text, how does it blend?", 0, 20);  
  push();
  shader(glslShader);
  shader(strokeShader);  
  blendMode(BLEND);
  strokeWeight(5);
  let colorArray;
  let z = 0;
  drawEllipse = (r,g,b,a,x,y) => {
    translate(0,0,z++);
    stroke(r,g,b,a);
    colorArray = [r/255, g/255, b/255, a/255];
    console.log(colorArray);
    glslShader.setUniform("uColor", colorArray);
    ellipse(x, y, 150);
  }
  drawEllipse(255,  0,  0,64,-55,  0);
  drawEllipse(  0,255,  0,64, 55,  0);
  drawEllipse(  0,  0,255,64,  0, 75);
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
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\style.css
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

canvas {
  display: block;
}
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\css\console.css
ul#myULContainer {
  position: absolute;
  height: 5em;
  left: 1em;
  right: 1em;
  bottom: 1em;
  padding: 10px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  cursor: pointer;
  opacity: 0.5;
  overflow-y: scroll;
  overscroll-behavior-y: contain;
  scroll-snap-type: y proximity;
  display: flex;
  flex-direction: column-reverse;
}
ul#myULContainer li {
  font-size: 0.6rem;
  font-family: monospace;
  list-style-type: none;
  margin-bottom: 0.1rem;
}

ul#myULContainer li:last-child {
  scroll-snap-align: end;
}
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\glsl\polygonFragmentShader.frag
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\glsl\polygonStrokeShader.js
/**
 * see https://p5js.org/reference/p5/baseStrokeShader/
 */
const polygonStrokeShader =
{
  uniforms: {
    'float time': () => millis()
  },
  declarations: 
  'vec3 myPosition;',
  'vec3 getLocalPosition': `(vec3 pos) {
    myPosition = pos;
    return pos;
  }`,
  'float getStrokeWeight': `(float w) {
    float scale = 0.7 + 0.3*sin(10.0 * sin(
      floor(time/250.) +
      myPosition.x*0.01 +
      myPosition.y*0.01
    ));
    return w * scale;
  }`,
  'vec4 getVertexColor': `(vec4 color) {    
    return color;
  }`
}
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\glsl\polygonVertexShader.vert
precision mediump float;
attribute vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\js\draw-base.js
function drawBase() {    
    if (width < height) {
        background(0);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("Please rotate your device to landscape", width / 2, height / 2);
        return;
    }
}
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\js\setup-base.js
function setupBase(){

}
```
```rnBasedTacticalSlingshotDestruction\monolithic-poc\0-the-interface-2\js\ui.class.js
class UI {
  font;
  background;
  cellDimension;
  zoom = 1.0;
  minZoom = 0.5;
  maxZoom = 3;
  isPannigCamera = false;
  originX = 0;
  originY = 0;
  relativeMouseX;
  relativeMouseY;
  pRelativeMouseX;
  pRelativeMouseY;
  viewHeight;
  viewWidth;
  data;
  constructor(){
    this.cellDimension = 50;
    this.data = {
      polygons: [],
    };
  }

  preload (){
    this.font = loadFont('fonts/Roboto-VariableFont_wdth,wght.ttf');
  }

  setup() {
    this.graphicsLayer = createGraphics(width, height);
    this.background = this.createBackground();
    textFont(this.font);
  }

  draw() {        
    this.zoomCamera();
    this.panCamera();
    push();
    translate(0, 0, -1); // The image is drawn in WEBGL with an implicit z of 0 and may appear "on top" of subsequently drawn lines if its coordinates are not adjusted.
    imageMode(CENTER);
    image(this.background, 0, 0);
    pop();
    resetShader();
    this.drawViewFrame();
    this.drawCursor()        
    this.drawPolygons();

    this.pRelativeMouseX = this.relativeMouseX;
    this.pRelativeMouseY = this.relativeMouseY;
  }

  setData(data) {
    this.data = data;
  }

  setPolygons(polygons) {
    this.data.polygons = polygons;
  }

  getPolygons() {
    return this.data.polygons;
  }

  drawPolygons() {
    this.data.polygons.forEach(polygon => {
      polygon.draw();
    });
  }

  drawCursor() {
    let x = this.getRelativeMouseX();
    let y = this.getRelativeMouseY();
    push();
    noFill();
    stroke(255, 0, 0);
    ellipse(x, y, 10, 10);
    fill(0);
    noStroke();
    textSize(8);
    textAlign(CENTER);
    text(`(${x.toFixed(1)}, ${y.toFixed(1)})`, x, y + 20);
    pop();
  }

  drawViewFrame(){
    this.viewHeight = height / this.zoom;
    this.viewWidth = width / this.zoom;
    push();
    rectMode(CENTER);
    noFill();
    stroke(255, 0, 0);
    strokeWeight(5);
    rect(-this.originX, -this.originY, this.viewWidth, this.viewHeight);    
    pop();
  }

  getRelativeMouseX() {
    return (mouseX - width/2) / this.zoom - this.originX;
  }
  
  getRelativeMouseY() {
    return (mouseY - height/2) / this.zoom - this.originY;
  }

  getPRelativeMouseX() {
    return (pmouseX - width/2) / this.zoom - this.originX;
  }
  
  getPRelativeMouseY() {
    return (pmouseY - height/2) / this.zoom - this.originY;
  }

  zoomCamera() {
    scale(this.zoom);
  }

  panCamera() {
    translate(this.originX, this.originY);
  }

  createBackground() {
    let gridBuffer = createGraphics(width, height);
    gridBuffer.clear();
    gridBuffer.push();
    gridBuffer.background(255);
    gridBuffer.translate(width / 2, height / 2);    
    let fontSizeBig = 10;
    let fontSizeSmall = 5;
    let colorBig = color('rgba(0%, 0%, 0%, 0.1)');
    let colorSmall = color('rgba(0%, 0%, 0%, 0.2)');
    gridBuffer.textAlign(CENTER); 
    gridBuffer.drawingContext.setLineDash([1, 2]);

    for (let x = -(width/this.cellDimension).toFixed(0)*this.cellDimension; x <= width; x += this.cellDimension) {
      gridBuffer.strokeWeight(1);
      if (x % 100 === 0) {
        gridBuffer.textSize(fontSizeBig);
        gridBuffer.stroke(colorBig);
        gridBuffer.fill(colorBig);
      } else {
        gridBuffer.textSize(fontSizeSmall);
        gridBuffer.stroke(colorSmall);
        gridBuffer.fill(colorSmall);
      }
      gridBuffer.line(x, -height, x, height);
      gridBuffer.stroke('white');
      gridBuffer.text(x, x, 0-2);
    }

    for (let y = -(height/this.cellDimension).toFixed(0)*this.cellDimension; y <= height; y += this.cellDimension) {
      gridBuffer.strokeWeight(1);
      if (y % 100 === 0) {
        gridBuffer.textSize(fontSizeBig);
        gridBuffer.stroke(colorBig);
        gridBuffer.fill(colorBig);
      } else {
        gridBuffer.textSize(fontSizeSmall);
        gridBuffer.stroke(colorSmall);
        gridBuffer.fill(colorSmall);
      }
      gridBuffer.line(-width, y, width, y);
      gridBuffer.stroke('white');
      gridBuffer.text(y, 0, y-2);
    }

    gridBuffer.stroke(255, 0, 0, 150);
    gridBuffer.strokeWeight(1);
    gridBuffer.line(-width, 0, width, 0);
    gridBuffer.stroke(0, 0, 255, 150);
    gridBuffer.strokeWeight(1);
    gridBuffer.line(0, -height, 0, height);
    gridBuffer.pop();

    return gridBuffer.get();
  }

  mousePressed() {

  }

  mouseReleased() {

  }

  mouseDragged() {
    let dx = this.getRelativeMouseX() - this.getPRelativeMouseX();
    let dy = this.getRelativeMouseY() - this.getPRelativeMouseY();
    console.log(`mouseDragged: dx: ${dx}, dy: ${dy}`);
    this.originX += dx;
    this.originY += dy;
  }

  mouseWheel(event) {
    let pivotX = this.getRelativeMouseX();
    let pivotY = this.getRelativeMouseY();
    let newZoom = constrain(this.zoom - event.delta * 0.001, this.minZoom, this.maxZoom);    
    this.originX = (mouseX - width / 2) / newZoom - pivotX;
    this.originY = (mouseY - height / 2) / newZoom - pivotY;    
    this.zoom = newZoom;
    console.log(`zoom: ${this.zoom}, originX: ${this.originX}, originY: ${this.originY}`);
    return false;
  }
}
```
