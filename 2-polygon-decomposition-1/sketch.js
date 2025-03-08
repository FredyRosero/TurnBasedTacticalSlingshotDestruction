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
    console.error("El archivo SVG no se cargó correctamente");
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
