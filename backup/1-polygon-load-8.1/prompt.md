```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\index.html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>I see you better with two ears</title>
  <script src="lib/p5.js"></script>
  <script type="application/javascript"
    src="//cdn.rawgit.com/Alorel/console-log-html/master/console-log-html.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/path-data-polyfill@1.0.6/path-data-polyfill.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/clipper-lib@6.4.2/clipper.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/earcut@3.0.1/dist/earcut.min.js"></script>
  <script src="glsl/polygonStrokeShader.js"></script>
  <script src="js/polygon.class.js?asd"></script>
  <script src="js/logic.class.js?zxc"></script>
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
    <p> 
      If we do a polgon triangulation, we can create a body from the triangles, which for Matter.js will always have the same centroid as the polygon.
    </p>
    <p>Press &lt;<em>space bar</em>&gt; to add a rectangle body.</p>
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
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\sketch.js
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
  gl.disable(gl.DEPTH_TEST); 
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  ui.setup();
  if (!terrainSVG || terrainSVG.length === 0) {
    console.error("El archivo SVG no se cargÃ³ correctamente");
    return;
  }
  let polygons = extractPolygonsFromSVG(terrainSVG);
  polygons.forEach(polygon => {
    polygon.scale(1.5,1.5);
    polygon.move(100-width/2,200-height/2);
  });   
  logic.setPolygons(polygons);
  console.log("logic.data.polygons:", logic.data.polygons);

}

function draw() {  
  //if (frameCount >= 60) return; // limit runtime
  logic.update();  
  
  let data = {
    polygons: logic.getPolygons()
  };
  ui.setData(data);
  
  drawBase();    
  drawDebug();  
  ui.draw();
}

function drawDebug() {
}

function keyPressed() {
  if (key === ' ') {
    let x = ui.getRelativeMouseX();
    let y = ui.getRelativeMouseY();
    let box = new Polygon(
      [
        createVector(x-20, y-20),
        createVector(x+20, y-20),
        createVector(x+20, y+20),
        createVector(x-20, y+20),
      ],
      0.5,
      'rgba(162, 0, 255, 0.15)',
      'rgba(255, 0, 200, 0.5)',
      false,
      false
    );
    logic.addPolygon(box);
  }
}

function mouseDragged() {
  ui.mouseDragged()
}

function mouseWheel(event) {
  ui.mouseWheel(event);
}

function mousePressed() {
  ui.mousePressed();
  let x = ui.getRelativeMouseX();
  let y = ui.getRelativeMouseY();
  logic.holeOnCricle(x, y, 100);
}

function mouseReleased() {
  ui.mouseReleased();
}

```
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\style.css
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

canvas {
  display: block;
}
```
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\assets\Assorted_polygons.svg
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="1190"
   height="280"
   viewBox="0 0 272 64"
   version="1.1"
   id="svg5"
   sodipodi:docname="Assorted_polygons.svg"
   inkscape:version="1.3.2 (091e20e, 2023-11-25, custom)"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs5" />
  <sodipodi:namedview
     id="namedview5"
     pagecolor="#ffffff"
     bordercolor="#000000"
     borderopacity="0.25"
     inkscape:showpageshadow="2"
     inkscape:pageopacity="0.0"
     inkscape:pagecheckerboard="0"
     inkscape:deskcolor="#d1d1d1"
     inkscape:zoom="1.5865546"
     inkscape:cx="952.37818"
     inkscape:cy="180.89513"
     inkscape:window-width="2100"
     inkscape:window-height="1246"
     inkscape:window-x="1699"
     inkscape:window-y="-9"
     inkscape:window-maximized="1"
     inkscape:current-layer="g5" />
  <path
     fill="#d77"
     d="m5.4,5.3 9,50.3 43.7,-10.4"
     id="path1" />
  <g
     stroke-linejoin="round"
     id="g5">
    <path
       fill="none"
       stroke="#000"
       d="m77.6,6 -9.6,46.4 30.9,6.4 9.6,-46.4 z"
       id="path2" />
    <path
       fill="#0f0"
       stroke="#00f"
       d="m124.8,48.5 33.6,9.6 14,-23.5 -4.8,-23 -39,-7 -8.5,24.5 15,-9.6 25,7 -8.5,17.6 -10.7,-3.2 3.2,-8.5 h-14 z"
       id="path3" />
    <path
       fill="#dbab3f"
       fill-rule="evenodd"
       stroke="#000000"
       d="M 183.93729,8.9779661 240.56949,16.540678 266.73051,5.4372881 266.3,57.6 255,20.2 177.3,57.6 Z"
       id="path5"
       sodipodi:nodetypes="ccccccc" />
  </g>
</svg>
```
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\css\console.css
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
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\glsl\polygonFragmentShader.frag
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}
```
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\glsl\polygonStrokeShader.js
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
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\glsl\polygonVertexShader.vert
precision mediump float;
attribute vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
```
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\js\draw-base.js
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
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\js\logic.class.js
const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;
class Logic {
  data;
  engine;
  constructor() {
    //Matter.Common.setDecomp(decomp);
    this.engine = Engine.create(),
      this.world = this.engine.world;
    this.data = {
      polygons: [],
      bodies: []
    };
  }

  update() {
    Matter.Engine.update(this.engine);
  }

  updateBodies() {
    while (this.data.bodies.length) {
      World.remove(this.world, this.data.bodies.pop());
    }
    this.data.bodies = this.data.polygons
      .map(polygon => polygonToBody(polygon))
      .filter(body => body !== null);
    console.log("updatePhysicsBodies:", this.data.bodies);
    this.data.bodies.forEach(body => World.add(this.world, body));
  }

  setPolygons(polygons) {
    this.data.polygons = Polygon.triangulatePolygons(polygons);
    this.updateBodies();
  }

  getPolygons() {
    return this.data.polygons;
  }

  addPolygon(polygon) {
    this.data.polygons.push(polygon);
    let body = polygonToBody(polygon);
    World.add(this.world, body);
    this.data.bodies.push(body);
    this.updateBodies();
  }

  holeOnCricle(x, y, r) {
    let hole = Polygon.createCirclePath(x, y, 25);
    let newPolygons = this.data.polygons
    .map(polygon => 
      Polygon.subtractPath(polygon.points, hole).filter(p => p.length > 2)
      .map(p => new Polygon(p, 0.5, polygon.fillColor, polygon.intenseColor, polygon.strokeColor, polygon.debug))
    ).flat();
    console.log("holeOnCricle", newPolygons);
    this.setPolygons(newPolygons);
  }

}

function polygonToBody(polygon) {
  let vertices = polygon.points.map(p => ({ x: p.x, y: p.y }));
  let centroid = polygon.getCentroid();
  let body = Bodies.fromVertices(centroid.x, centroid.y, [vertices], { isStatic: polygon.isStatic });
  if (!body) return null;
  body.centroid = centroid;
  return body;
}

```
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\js\polygon.class.js
class Polygon {

  static shader = null;
  static strokeShader = null;

  static preload() {
    Polygon.shader = loadShader('glsl/polygonVertexShader.vert', 'glsl/polygonFragmentShader.frag');
  }

  static setup() {
    Polygon.strokeShader = baseStrokeShader().modify(polygonStrokeShader);
  }

  static triangulatePolygons(polygons) {
    let newPolygons = [];
    for (let polygon of polygons) {
      let coords = [];
      polygon.points.forEach(p => {
        coords.push(p.x, p.y);
      });
      let indexTriangledPoints = earcut.default(coords);
      for (let i = 0; i < indexTriangledPoints.length; i += 3) {
        let idx0 = indexTriangledPoints[i];
        let idx1 = indexTriangledPoints[i + 1];
        let idx2 = indexTriangledPoints[i + 2];
        let newPolygon = new Polygon(
          [
            createVector(polygon.points[idx0].x, polygon.points[idx0].y),
            createVector(polygon.points[idx1].x, polygon.points[idx1].y),
            createVector(polygon.points[idx2].x, polygon.points[idx2].y)
          ],
          0.5,
          polygon.fillColor,
          polygon.intenseColor,
          polygon.strokeColor,
          polygon.debug
        );
        newPolygons.push(newPolygon);
      }
    }
    return newPolygons;
  }

  static createCirclePath(cx, cy, r, numSegments = 10) {
    let path = [];
    for (let i = 0; i < numSegments; i++) {
      let angle = map(i, 0, numSegments, 0, TWO_PI);
      path.push(createVector(cx + r * cos(angle), cy + r * sin(angle)));
    }
    return path;
  }

  static subtractPath(subjectPoinst, clipPoints) {
    let scale = 100; 
    let subj = [subjectPoinst.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
    let clip = [clipPoints.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
    
    let cpr = new ClipperLib.Clipper();
    cpr.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);
    cpr.AddPaths(clip, ClipperLib.PolyType.ptClip, true);
    
    let solution = new ClipperLib.Paths();
    cpr.Execute(ClipperLib.ClipType.ctDifference, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

    let result = solution.map(path => path.map(pt => createVector(pt.X / scale, pt.Y / scale)));
    const epsilon = 2; 
    let simplified = result.map(path => Polygon.simplifyPath(path, epsilon));
    return simplified;
  }

  static simplifyPath(points, epsilon) {
    if (points.length < 3) return points;
    
    // Encuentra el punto con la mayor distancia
    let dmax = 0;
    let index = 0;
    let end = points.length - 1;
    
    for (let i = 1; i < end; i++) {
      let d = Polygon.perpendicularDistance(points[i], points[0], points[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
    
    // Si el mÃ¡ximo es mayor que epsilon, se simplifica recursivamente
    if (dmax > epsilon) {
      let recResults1 = Polygon.simplifyPath(points.slice(0, index + 1), epsilon);
      let recResults2 = Polygon.simplifyPath(points.slice(index), epsilon);
      
      // Combina resultados, evitando duplicar el punto del medio
      return recResults1.slice(0, -1).concat(recResults2);
    } else {
      // Si no es mayor, se mantiene la lÃ­nea formada por el primer y Ãºltimo punto
      return [points[0], points[end]];
    }
  }
  
  static perpendicularDistance(point, lineStart, lineEnd) {
    let dx = lineEnd.x - lineStart.x;
    let dy = lineEnd.y - lineStart.y;
    if (dx === 0 && dy === 0) {
      return Polygon.calculateDistance(point, lineStart);
    }
    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    let nearestX = lineStart.x + t * dx;
    let nearestY = lineStart.y + t * dy;
    return Polygon.calculateDistance(point, createVector(nearestX, nearestY));
  }
  
  static calculateDistance(pt1, pt2) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
  }

  points = [];
  fillColor;
  strokeColor;
  centroid;
  isStatic = true;
  debug = false;

  /**
   * Creates a new Polygon instance.
   *
   * @param {Array} points - An array of points defining the polygon's vertices.
   * @param {float} z - The z value of the polygon.
   * @param {(string|number)} fill - The fill color value, interpreted by the color() function.
   * @param {(string|number)} stroke - The stroke color value, interpreted by the color() function.
   * @param {boolean} [isStatic=true] - Optional flag to make de polygon static.
   * @param {boolean} [debug=false] - Optional flag to enable debugging mode.
   */
  constructor(points, z, fill, stroke, isStatic = true, debug = false) {
    this.points = points;
    this.z = z;
    this.isStatic = isStatic;
    this.fillColor = color(fill);
    this.fillColorArray = [red(this.fillColor) / 255, green(this.fillColor) / 255, blue(this.fillColor) / 255, alpha(this.fillColor) / 255];
    this.strokeColor = color(stroke);
    this.strokeColorArray = [red(this.strokeColor) / 255, green(this.strokeColor) / 255, blue(this.strokeColor) / 255, alpha(this.strokeColor) / 255];

    colorMode(HSB, 255);
    this.intenseColor = color(fill.toString());
    this.intenseColor = color(hue(this.intenseColor), 255, 255, 255);    
    this.intenseColorArray = [red(this.intenseColor) / 255, green(this.intenseColor) / 255, blue(this.intenseColor) / 255, alpha(this.intenseColor) / 255];
    colorMode(RGB, 255);

    this.debug = debug;
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
    blendMode(MULTIPLY);
    stroke(this.strokeColor);
    fill(this.fillColor);
    shader(Polygon.shader);

    let coords = [];
    this.points.forEach(p => {
      coords.push(p.x, p.y);
    });
    let triangledPoints = earcut.default(coords);

    if (this.debug) this.drawDebug();

    push();
    Polygon.shader.setUniform("uColor", this.strokeColorArray);
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

    push();
    Polygon.shader.setUniform("uColor", this.fillColorArray);
    beginShape(TRIANGLES);
    for (let i = 0; i < triangledPoints.length; i++) {
      let idx = triangledPoints[i];
      vertex(this.points[idx].x, this.points[idx].y, this.z, 0.5, 0.5);
    }
    endShape();
    pop();
  }


  drawDebug() {
    push();
    textSize(4);    
    Polygon.shader.setUniform("uColor", this.strokeColorArray);
    fill(this.strokeColor);
    stroke(this.strokeColor);
    for (let i = 0; i < this.points.length; i++) {
      ellipse(this.points[i].x, this.points[i].y, 2, 2);
    }
    pop();
  }


  drawShaderLine(x1, y1, x2, y2, colorStroke) {
    push();
    translate(0, 0, this.z + 0.4);
    shader(Polygon.strokeShader);
    strokeWeight(3);
    beginShape(LINES);
    vertex(x1, y1, this.z + 0.1);
    vertex(x2, y2, this.z + 0.1);
    endShape();
    pop();
  }

  /**
   * Returns a string representation of the polygon.
   * 
   * @returns {string} A string containing the polygon's details.
   */
  toString() {
    const centroid = this.getCentroid();
    return `Polygon: ${this.points.length} points, centroid: (${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)}), isStatic: ${this.isStatic}`;
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
      0.1,
      `hsla(${hue}, 100%, 50%, 0.2)`,
      `hsla(${hue}, 100%, 50%, 0.4)`,
      true,
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
  for (let cmd of pathData) {
    if ("MLHVmlhv".indexOf(cmd.type) !== -1) {
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
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\js\setup-base.js
function setupBase(){

}
```
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\js\testing-box.js
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
```urnBasedTacticalSlingshotDestruction\monolithic-poc\1-polygon-load-8\js\ui.class.js
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

  getData(){
    return this.data;
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
