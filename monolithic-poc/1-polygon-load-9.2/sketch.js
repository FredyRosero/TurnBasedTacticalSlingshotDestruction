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
    console.error("El archivo SVG no se cargó correctamente");
    return;
  }
  let terrainPolygons = extractPolygonsFromSVG(terrainSVG);
  terrainPolygons.forEach(polygon => {
    polygon.scale(1.5,1.5);
    polygon.move(100-width/2,200-height/2);
  });   
  logic.setTerrain(Polygon.triangulatePolygons(terrainPolygons));
}

function draw() {  
  //if (frameCount >= 60) return; // limit runtime
  logic.update();  
  
  let data = {
    polygons: logic.getPolygonsFromBodies()
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
    logic.addBodyFromPolygon(box);
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

