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
  gl.disable(gl.DEPTH_TEST); 
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  ui.setup();
  if (!terrainSVG || terrainSVG.length === 0) {
    console.error("El archivo SVG no se cargó correctamente");
    return;
  }
  console.log("svg:", terrainSVG);
  let polygons = extractPolygonsFromSVG(terrainSVG);
  polygons.forEach(polygon => {
    polygon.scale(1.5,1.5);
    polygon.move(100-width/2,200-height/2);
  });
  let hullPolygons = [];
  let hue = 180;
  polygons.forEach(polygon => {
    // points to array of points
    let points = polygon.points.map((point) => [point.x, point.y])
    let hullPoints = d3.polygonHull(points).map((point) => createVector(point[0],point[1]));
    console.log(polygon.points,"->", hullPoints);
    if (hullPoints.length < 2) return;
    let poly = new Polygon(
      hullPoints,
      `hsla(${hue}, 100%, 50%, 0.5)`,
      `hsla(${hue}, 100%, 50%, 0.8)`,
      true
    );
    hullPolygons.push(poly);
  });
  polygons = [...hullPolygons, ...polygons]
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
