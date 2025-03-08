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
    console.error("El archivo SVG no se cargó correctamente");
    return;
  }
  let polygons = extractPolygonsFromSVG(terrainSVG);
  polygons.forEach(polygon => {
    polygon.scale(1.5,1.5);
    polygon.move(100-width/2,200-height/2);
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
