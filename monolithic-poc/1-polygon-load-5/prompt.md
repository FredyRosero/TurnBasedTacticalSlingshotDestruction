```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\index.html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>From polygons to bodies?</title>
  <script src="lib/p5.js"></script>
  <script type="application/javascript"
    src="//cdn.rawgit.com/Alorel/console-log-html/master/console-log-html.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/path-data-polyfill@1.0.6/path-data-polyfill.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.js"></script>
  <!-- <script src="https://cdn.jsdelivr.net/npm/poly-decomp@0.2.1/build/decomp.js"></script> -->
  <script src="https://cdn.jsdelivr.net/npm/earcut@3.0.1/dist/earcut.min.js"></script>
  <script src="glsl/polygonStrokeShader.js"></script>
  <script src="js/polygon.class.js?22dee"></script>
  <script src="js/logic.class.js?utu"></script>
  <script src="js/ui.class.js?b456"></script>
  <script src="js/setup-base.js"></script>
  <script src="js/draw-base.js"></script>
  <script src="js/testing-box.js"></script>
  <link rel="stylesheet" type="text/css" href="style.css">
  <link rel="stylesheet" type="text/css" href="css/console.css">
  <meta charset="utf-8" />
</head>

<body>
  <div
    style="position: absolute; height: 33vh; width: calc(50vw - 4rem); padding: 1rem; left: calc(50vw + 1rem); top: calc(33vh - 2em); overflow: auto;">
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
<script src="sketch.js?asda12"></script>

</html>
```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\sketch.js
let ui;
let logic;
let gl;
function preload(){  
  ui = new UI();
  logic = new Logic();
  ui.preload();
  terrainSVG = loadStrings('assets/Assorted_polygons.svg');
  Polygon.preload();
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
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
    polygon.move(100-width/2,200-height/2);
  });   
  logic.setPolygons(polygons);
  console.log("logic.data.polygons:", logic.data.polygons);

}

function draw() {  
  //if (frameCount >= 5) return;
  logic.update();  
  
  let data = {
    polygons: logic.getPolygons()
  };
  let subpolygons = [];
  let hue = 0;
/*   logic.data.bodies.forEach(body => {
    body.parts.forEach(part => {
      subpolygons.push(new Polygon(
        part.vertices.map(v => createVector(v.x, v.y)),
        0,2,
        `hsla(${hue}, 50%, 50%, 0.1)`,
        `hsla(${hue}, 50%, 90%, 0.5)`,
        true
      ));
    });
  }); */
  //data = { polygons: [...data.polygons, ...subpolygons] }

  ui.setData(data);
  
  drawBase();    
  drawDebug();  
  ui.draw();
}

function drawDebug() {

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
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\style.css
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

canvas {
  display: block;
}
```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\assets\Assorted_polygons.svg
<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1190" height="280" viewBox="0 0 272 64">
	<path fill="#d77" d="m5.4,5.3 9,50.3 43.7,-10.4"/>
	<g stroke-linejoin="round">
		<path fill="none" stroke="#000" d="m77.6,6 -9.6,46.4 30.9,6.4 9.6,-46.4 z"/>
		<path fill="#0f0" stroke="#00f" d="m124.8,48.5 33.6,9.6 14,-23.5 -4.8,-23 -39,-7 -8.5,24.5 15,-9.6 25,7 -8.5,17.6 -10.7,-3.2 3.2,-8.5 h-14 z"/>
		<path fill="#947300" d="m215.8,29.3 5.6,-4 9.3,6.6 -9.5,4.5 z"/>
		<path fill="#dbab3f" fill-rule="evenodd" stroke="#000" d="m249.2,4.8 -11.8,52.8 -35.5,-46.4 64.4,46.4 -11.3,-37.4 -77.7,37.4 z"/>
	</g>
</svg>
```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\assets\terrain.1.svg
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   width="600"
   height="600"
   viewBox="0 0 600 600"
   version="1.1"
   id="svg1"
   inkscape:version="1.3.2 (091e20e, 2023-11-25, custom)"
   sodipodi:docname="terrain.1.svg"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <sodipodi:namedview
     id="namedview1"
     pagecolor="#ffffff"
     bordercolor="#000000"
     borderopacity="0.25"
     inkscape:showpageshadow="2"
     inkscape:pageopacity="0.0"
     inkscape:pagecheckerboard="0"
     inkscape:deskcolor="#d1d1d1"
     inkscape:document-units="px"
     inkscape:zoom="0.91936025"
     inkscape:cx="152.27981"
     inkscape:cy="253.4371"
     inkscape:window-width="2100"
     inkscape:window-height="1246"
     inkscape:window-x="1699"
     inkscape:window-y="-9"
     inkscape:window-maximized="1"
     inkscape:current-layer="layer1" />
  <defs
     id="defs1" />
  <g
     inkscape:label="Capa 1"
     inkscape:groupmode="layer"
     id="layer1">
    <path
       style="fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:90;paint-order:markers stroke fill"
       d="M 92.455596,309.99818 119.64842,251.26168 155.54294,306.73504 Z"
       id="path1" />
    <path
       style="fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:90;paint-order:markers stroke fill"
       d="M 175.12178,275.19142 225.15657,237.12142 276.27908,275.19142 221.89343,336.10329 Z"
       id="path2" />
    <path
       style="fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:90;paint-order:markers stroke fill"
       d="M 295.85796,241.47232 344.80504,211.10413 392.66441,222.98115 404.62925,282.80536 326.31392,303.38413 Z"
       id="path3" />
    <path
       style="fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:90;paint-order:markers stroke fill"
       d="M 428.1406,267.48963 487.96481,286.61234 524.94705,248.99846 536.91189,308.82267 458.59656,329.40144 Z"
       id="path3-2"
       sodipodi:nodetypes="cccccc" />
  </g>
</svg>
```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\css\console.css
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
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\glsl\polygonFragmentShader.frag
precision mediump float;
uniform vec4 uColor;
uniform float uOffset;

void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}

```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\glsl\polygonStrokeShader.js
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
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\glsl\polygonVertexShader.vert
precision mediump float;
attribute vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\js\draw-base.js
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
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\js\logic.class.js
const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;
class Logic {
  data;
  engine;
  constructor() {
    //Matter.Common.setDecomp(decomp);
    this.engine = Engine.create(),
    this.world =  this.engine.world;
    this.data = {
      polygons: [],
      bodies: []
    };
  }

  update() {
    Matter.Engine.update(this.engine);  
  }

  updatePhysicsBodies() {
    console.log("updatePhysicsBodies(): polygons input:", this.data.polygons);
    while (this.data.bodies.length) {
      Matter.World.remove(this.world, this.data.bodies.pop());
    }
    this.data.bodies = this.data.polygons.map(polygon => polygonToBody(polygon));
    console.log("updatePhysicsBodies(): bodies output:", this.data.bodies);
    Matter.World.add(this.world, this.data.bodies);
  }

  setPolygons(polygons) {
    this.data.polygons = polygons;
    this.updatePhysicsBodies();
  }

  getPolygons() {
    return this.data.polygons;
  }

}

function polygonToBody(polygon) {
  let vertices = polygon.points.map(p => ({ x: p.x, y: p.y }));
  let centroid = polygon.getCentroid();
  let body = Matter.Bodies.fromVertices(centroid.x, centroid.y, [vertices], {
    isStatic: true
  });
  body.centroid = centroid;
  return body;
}

```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\js\polygon.class.js
class Polygon {

  static shader = null;
  static strokeShader = null;

  static preload() {
    Polygon.shader = loadShader('glsl/polygonVertexShader.vert', 'glsl/polygonFragmentShader.frag');
    console.log("Polygon.shader:", Polygon.shader);
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
   * @param {float} z - The z value of the polygon.
   * @param {(string|number)} fill - The fill color value, interpreted by the color() function.
   * @param {(string|number)} stroke - The stroke color value, interpreted by the color() function.
   * @param {boolean} [debug=false] - Optional flag to enable debugging mode.
   */
  constructor(points, z, fill, stroke, debug = false) {
    console.log("Polygon.constructor():\n", points, fill, stroke, debug);
    this.debug = debug;
    this.fillColor = color(fill);
    this.strokeColor = color(stroke);
    this.intenseColor = color(this.strokeColor.toString());
    colorMode(HSB, 255);
    this.intenseColor = color(hue(this.intenseColor), 255, 255, 200);
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

  getCentroid() {
    let x = 0.0, y = 0.0;
    this.points.forEach(v => {
      x += v.x;
      y += v.y;
    });
    return { x: x / this.points.length, y: y / this.points.length };
  }


  draw() {
    //shader(Polygon.strokeShader);
    stroke(this.strokeColor);
    fill(this.fillColor);
    //shader(Polygon.shader);
    //Polygon.shader.setUniform("uOffset", millis() / 1000);

    let coords = [];
    this.points.forEach(p => {
      coords.push(p.x, p.y);
    });
    let triangledPoints = earcut.default(coords);

    /*
    push();
      Polygon.shader.setUniform("uColor", [
        1.0,
        0,0,
        0,0,
        1.0
      ]);
      beginShape(LINES);
      for (let i = 0; i < triangledPoints.length; i += 3) {
        let idx0 = triangledPoints[i];
        let idx1 = triangledPoints[i + 1];
        let idx2 = triangledPoints[i + 2];

        vertex(this.points[idx0].x, this.points[idx0].y, this.z);
        vertex(this.points[idx1].x, this.points[idx1].y, this.z);
  
        vertex(this.points[idx1].x, this.points[idx1].y, this.z);
        vertex(this.points[idx2].x, this.points[idx2].y, this.z);
  
        vertex(this.points[idx2].x, this.points[idx2].y, this.z);
        vertex(this.points[idx0].x, this.points[idx0].y, this.z);
      }
      endShape();
    pop(); 
    */

    push();
    //shader(Polygon.shader);
/*     Polygon.shader.setUniform("uColor", [
      red(this.fillColor) / 255,
      green(this.fillColor) / 255,
      blue(this.fillColor) / 255,
      alpha(this.fillColor) / 255
    ]); */
    beginShape(TRIANGLES);
    for (let i = 0; i < triangledPoints.length; i++) {
      let idx = triangledPoints[i];
      vertex(this.points[idx].x, this.points[idx].y, this.z, 0.5, 0.5);
    }
    endShape();
    pop();

    //if (this.debug) this.drawDebug();
  }


  drawDebug() {
    shader(Polygon.strokeShader);
    push();
    textSize(4);
    fill(this.intenseColor);
    noStroke();
    for (let i = 0; i < this.points.length; i++) {
      ellipse(this.points[i].x, this.points[i].y, 2, 2);
      text(`(${this.points[i].x.toFixed(1)}, ${this.points[i].y.toFixed(1)})`, this.points[i].x - 5, this.points[i].y + 7);
    }
    this.drawDebugCentroidCalculation()
    pop();
  }

  drawDebugCentroidCalculation() {
    let centroid = this.getCentroid();
    fill(this.strokeColor);
    ellipse(centroid.x, centroid.y, 4, 4);
    text(`(${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)})`, centroid.x - 5, centroid.y + 7);
    stroke(this.strokeColor);
    for (let i = 0; i < this.points.length; i++) {
      this.drawShaderLine(centroid.x, centroid.y, this.points[i].x, this.points[i].y, this.strokeColor);
    }
  }

  drawShaderLine(x1, y1, x2, y2, colorStroke) {
    push();
    shader(Polygon.shader);
    // Configuramos el color como uniforme en el shader
    Polygon.shader.setUniform('uColor', [
      red(colorStroke) / 255,
      green(colorStroke) / 255,
      blue(colorStroke) / 255,
      alpha(colorStroke) / 255
    ]);
    beginShape(LINES);
    vertex(x1, y1, this.z + 0.1);
    vertex(x2, y2, this.z + 0.1);
    endShape();
    resetShader();
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
    let hue = 0;
    let poly = new Polygon(
      parsePath(svgPath),
      0.0,
      `hsla(${hue}, 100%, 100%, 1.0)`,
      `hsla(${hue}, 100%, 100%, 1.0)`,
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
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\js\setup-base.js
function setupBase(){

}
```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\js\testing-box.js
function keyPressed() {
    if (key === ' ') {
      let box = Bodies.rectangle(mouseX, mouseY, 40, 40, {
        restitution: 0.5,
        density: 0.001
      });
      World.add(world, box);
      boxes.push(box);
    }
  }
```
```nBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-4\js\ui.class.js
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
