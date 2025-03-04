```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\index.html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>How the point do I load polygons?</title>
  <script src="lib/p5.js"></script>
  <script type="application/javascript"
    src="//cdn.rawgit.com/Alorel/console-log-html/master/console-log-html.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/path-data-polyfill@1.0.6/path-data-polyfill.min.js"></script>
  <script src="glsl/polygonStrokeShader.js"></script>
  <script src="js/polygon.class.js?asdq"></script>
  <script src="js/ui.class.js"></script>
  <script src="js/setup-base.js"></script>
  <script src="js/draw-base.js"></script>
  <link rel="stylesheet" type="text/css" href="style.css">
  <link rel="stylesheet" type="text/css" href="css/console.css">
  <meta charset="utf-8" />
</head>

<body>
  <div
    style="position: absolute; height: 33vh; width: calc(50vw - 4rem); padding: 1rem; left: calc(50vw + 1rem); top: calc(33vh - 2em); overflow: auto;">
    <p>In <a href="/wiki/Geometry" title="Geometry">geometry</a>, a <b>polygonal chain</b><sup id="cite_ref-Names_1-0" class="reference"><a href="#cite_note-Names-1"><span class="cite-bracket">[</span>a<span class="cite-bracket">]</span></a></sup> is a connected series of <a href="/wiki/Line_segment" title="Line segment">line segments</a>. More formally, a polygonal chain <span class="nowrap">â <span class="mwe-math-element"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle P}">
      <semantics>
        <mrow class="MJX-TeXAtom-ORD">
          <mstyle displaystyle="true" scriptlevel="0">
            <mi>P</mi>
          </mstyle>
        </mrow>
        <annotation encoding="application/x-tex">{\displaystyle P}</annotation>
      </semantics>
    </math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/b4dc73bf40314945ff376bd363916a738548d40a" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -0.338ex; width:1.745ex; height:2.176ex;" alt="{\displaystyle P}"></span>â </span> is a <a href="/wiki/Curve" title="Curve">curve</a> specified by a <a href="/wiki/Sequence" title="Sequence">sequence</a> of points <span class="mwe-math-element"><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\displaystyle (A_{1},A_{2},\dots ,A_{n})}">
      <semantics>
        <mrow class="MJX-TeXAtom-ORD">
          <mstyle displaystyle="true" scriptlevel="0">
            <mo stretchy="false">(</mo>
            <msub>
              <mi>A</mi>
              <mrow class="MJX-TeXAtom-ORD">
                <mn>1</mn>
              </mrow>
            </msub>
            <mo>,</mo>
            <msub>
              <mi>A</mi>
              <mrow class="MJX-TeXAtom-ORD">
                <mn>2</mn>
              </mrow>
            </msub>
            <mo>,</mo>
            <mo>â€¦<!-- â€¦ --></mo>
            <mo>,</mo>
            <msub>
              <mi>A</mi>
              <mrow class="MJX-TeXAtom-ORD">
                <mi>n</mi>
              </mrow>
            </msub>
            <mo stretchy="false">)</mo>
          </mstyle>
        </mrow>
        <annotation encoding="application/x-tex">{\displaystyle (A_{1},A_{2},\dots ,A_{n})}</annotation>
      </semantics>
    </math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/7b5661f3278d5f9bdde12155683926e08ac5893e" class="mwe-math-fallback-image-inline mw-invert skin-invert" aria-hidden="true" style="vertical-align: -0.838ex; width:16.578ex; height:2.843ex;" alt="{\displaystyle (A_{1},A_{2},\dots ,A_{n})}"></span> called its <a href="/wiki/Vertex_(geometry)" title="Vertex (geometry)">vertices</a>. The curve itself consists of the line segments connecting the consecutive vertices.
    </p>
    <p>A <b>closed polygonal chain</b> is one in which the first vertex coincides with the last one, or, alternatively,
      the first and the last vertices are also connected by a line segment.<sup id="cite_ref-2" class="reference"><a
          href="#cite_note-2"><span class="cite-bracket">[</span>1<span class="cite-bracket">]</span></a></sup>
      A simple closed polygonal chain in <a href="/wiki/Plane_(geometry)" class="mw-redirect"
        title="Plane (geometry)">the plane</a> is the boundary of a <a href="/wiki/Simple_polygon"
        title="Simple polygon">simple polygon</a>. Often the term "<a href="/wiki/Polygon" title="Polygon">polygon</a>"
      is used in the meaning of "closed polygonal chain", but in some cases it is important to draw a distinction
      between a <a href="/wiki/Polygonal_area" class="mw-redirect" title="Polygonal area">polygonal area</a> and a
      polygonal chain. A <a href="/wiki/Space_curve" class="mw-redirect" title="Space curve">space</a> closed polygonal
      chain is also known as a <a href="/wiki/Skew_polygon" title="Skew polygon">skew "polygon"</a>.
    </p>
    <a href="https://en.wikipedia.org/wiki/Polygonal_chain#Closed">https://en.wikipedia.org/wiki/Polygonal_chain#Closed</a>
  </div>
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
<script src="sketch.js?rndstr=<%= getRandomStr() %>"></script>

</html>
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\sketch.js
let ui = new UI();
let gl;
function preload(){  
  ui.preload();
  terrainSVG = loadStrings('https://upload.wikimedia.org/wikipedia/commons/1/1f/Assorted_polygons.svg');
  Polygon.preload();
}

function setup() {
  createCanvas(windowWidth, windowHeight,WEBGL);
  Polygon.setup();
  gl = this._renderer.GL;
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  ui.setup();
  if (!terrainSVG || terrainSVG.length === 0) {
    console.error("El archivo SVG no se cargÃ³ correctamente");
    return;
  }
  console.log("svg:", terrainSVG);
  let polygons = extractPolygonsFromSVG(terrainSVG);
  polygons.forEach(polygon => {
    polygon.scale(1.5,1.5);
    polygon.move(250-width/2,200-height/2);
  });
  ui.setPolygons(polygons);
  console.log("ui.data.polygons:", ui.data.polygons);
}

function draw() {  
  drawBase();    
  ui.draw();  
}

function mouseDragged() {
  ui.mouseDragged();
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
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\style.css
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

canvas {
  display: block;
}
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\css\console.css
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
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\glsl\polygonFragmentShader.frag
precision mediump float;
varying vec4 vColor;

void main() {  
  //gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 1.0, 1.0);
   gl_FragColor = vColor;
}
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\glsl\polygonStrokeShader.js
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
    float scale = 0.8 + 0.2*sin(10.0 * sin(
      floor(time/250.) +
      myPosition.x*0.01 +
      myPosition.y*0.01
    ));
    return w * scale;
  }`,
  'vec4 getVertexColor': `(vec4 color) {
    return color + vec4(myPosition.x*0.025 + myPosition.y*0.025, myPosition.x*0.01, myPosition.y*0.01, 0.0);
  }`
}
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\glsl\polygonVertexShader.vert
precision mediump float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec4 aColor;

varying vec3 vPosition;
varying vec4 vColor;

void main() {
  vPosition = aPosition;
  vColor = aColor;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\js\draw-base.js
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
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\js\polygon.class.js
class Polygon {

  static shader = null;
  static strokeShader = null;

  static preload() {
    Polygon.shader = loadShader('glsl/polygonVertexShader.vert', 'glsl/polygonFragmentShader.frag');
  }

  static setup() {
    Polygon.strokeShader = baseStrokeShader().modify(polygonStrokeShader);
  }

  points = [];
  fillColor;
  strokeColor;
  centroid;
  debug = false;

  /**
   * Creates a new Polygon instance.
   *
   * @param {Array} points - An array of points defining the polygon's vertices.
   * @param {(string|number)} fill - The fill color value, interpreted by the color() function.
   * @param {(string|number)} stroke - The stroke color value, interpreted by the color() function.
   * @param {boolean} [debug=false] - Optional flag to enable debugging mode.
   */
  constructor(points, fill, stroke, debug = false) {
    //console.log("Polygon.constructor():\n", points, fill, stroke, debug);
    this.debug = debug;
    this.fillColor = color(fill);
    this.strokeColor = color(stroke);
    this.intenseColor = color(this.strokeColor.toString());
    colorMode(HSL, 100);
    this.intenseColor = color(hue(this.intenseColor), 100, 25, 100);
    colorMode(RGB, 255);
    this.points = points;
  }

  forEach(labda) {
    this.points.forEach(labda);
  };

  move(x, y) {
    this.forEach(p => p.add(x, y));
  }

  scale(x, y) {
    this.forEach(p => p.mult(x, y));
  }

  setStrokeShader() {

  }

  draw() {
    push();
    shader(Polygon.shader);
/*     Polygon.shader.setUniform("uColor", [
      red(this.fillColor) / 255,
      green(this.fillColor) / 255,
      blue(this.fillColor) / 255,
      alpha(this.fillColor) / 255
    ]); */
    beginShape();
    this.points.forEach(p => {
      fill(random(255),random(255),random(255));
      vertex(p.x, p.y);
    });
    endShape();
    pop();

    push();
    translate(0, 0, 0.1);
    shader(Polygon.strokeShader);
    Polygon.strokeShader.setUniform('time',millis());
    stroke(this.strokeColor);  
    strokeWeight(2);
    beginShape(LINES);
    this.points.forEach((p, i) => {
      vertex(p.x, p.y);
      let next = this.points[(i + 1) % this.points.length];
      vertex(next.x, next.y);
    });
    endShape();
    pop();
    if (this.debug) this.drawDebug();
  }


  drawDebug() {
    push();
    textSize(4);
    fill(this.intenseColor);
    noStroke();
    for (let i = 0; i < this.points.length; i++) {
      ellipse(this.points[i].x, this.points[i].y, 2, 2);
      text(`(${this.points[i].x.toFixed(1)}, ${this.points[i].y.toFixed(1)})`, this.points[i].x - 5, this.points[i].y + 7);
    }
    pop();
  }
}

/**
 * Extracts polygons from an SVG string and returns them as an array.
 * 
 * This function parses the provided SVG content, extracts all <path> elements,
 * and converts them into polygon objects using the `parsePath` function.
 * 
 * @returns {Array} An array of polygon objects extracted from the SVG.
 *                  Returns an empty array if no <path> elements are found.
 * 
 * @throws Will log an error message if the SVG content is empty or if no <path> elements are found.
 */
function extractPolygonsFromSVG(svg) {
  let polys = [];
  if (!svg || svg.length === 0) {
    console.error("No hay contenido SVG para procesar");
    return;
  }
  let parser = new DOMParser();
  let svgDoc = parser.parseFromString(svg.join('\n'), "image/svg+xml");
  let svgPaths = svgDoc.getElementsByTagName("path");
  if (svgPaths.length === 0) {
    console.error("No se encontraron elementos <path> en el SVG");
    return;
  }
  for (let svgPath of svgPaths) {
    let hue = random(360).toFixed(0);
    let poly = new Polygon(
      parsePath(svgPath),
      `hsla(${hue}, 100%, 50%, 0.5)`,
      `hsla(${hue}, 100%, 50%, 0.5)`,
      true
    );
    polys.push(poly);
  }
  return polys;
}

/**
 * Parses an SVG path and converts it into an array of vectors.
 * 
 * @requires https://github.com/jarek-foksa/path-data-polyfill
 *
 * @param {SVGPathElement} path - The SVG path element to parse.
 * @returns {Array<{x: number, y: number}>} An array of vectors representing the path.
 */
function parsePath(path) {
  let pathData = path.getPathData();
  let out = [];
  console.log(`Parsing SVG`);
  for (let cmd of pathData) {
    if ("MLHVmlhv".indexOf(cmd.type) !== -1) {
      console.log(`cmd.type: ${cmd.type}, cmd.values: ${cmd.values}`);
      let x, y;
      if (cmd.type === "M" || cmd.type === "L") {
        x = cmd.values[0];
        y = cmd.values[1];
      } else if (cmd.type === "m" || cmd.type === "l") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x + cmd.values[0];
        y = last.y + cmd.values[1];
      } else if (cmd.type === "H") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = cmd.values[0];
        y = last.y;
      } else if (cmd.type === "h") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x + cmd.values[0];
        y = last.y;
      } else if (cmd.type === "V") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x;
        y = cmd.values[0];
      } else if (cmd.type === "v") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x;
        y = last.y + cmd.values[0];
      }
      out.push(createVector(x, y));
    }
  }
  return out;
}
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\js\setup-base.js
function setupBase(){

}
```
```BasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-2\js\ui.class.js
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
    this.drawBackground();
    this.drawViewFrame();
    this.drawPolygons();    
    this.drawCursor();
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

  drawBackground(){
    push();
    translate(0, 0, -1); // The image is drawn in WEBGL with an implicit z of 0 and may appear "on top" of subsequently drawn lines if its coordinates are not adjusted.
    imageMode(CENTER);
    image(this.background, 0, 0);
    pop();
  }

  drawCursor() {
    let x = this.getRelativeMouseX();
    let y = this.getRelativeMouseY();
    push();
    noFill();
    stroke(255, 0, 0);
    translate(0,0,1)
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
    return false;
  }
}
```
