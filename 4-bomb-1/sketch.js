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
  frameRate(15);
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
  drawBombVector();
}

function drawDebug() {
}

function drawBombVector() {
  if (bombStartPos !== null) {
    bombEndPos = createVector(ui.getRelativeMouseX(), ui.getRelativeMouseY());
    vector = createVector(bombEndPos.x - bombStartPos.x, bombEndPos.y - bombStartPos.y);
    // normalizamos el vector para que la fuerza sea constante.
    vector.normalize();
    intensity = (millis() - bomStartTime) / 150000;
    let forceVector = createVector(vector.x, vector.y).mult(map(intensity, 0, 1, 0, 5000));
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    beginShape(LINES);
    vertex(bombStartPos.x, bombStartPos.y);
    vertex(bombStartPos.x + forceVector.x, bombStartPos.y + forceVector.y);
    endShape();
    pop();       
  }
}

// Variable global para guardar la posición inicial de la bomba.
let bombStartPos = null;
let bombEndPos = null;
let bomStartTime = null;
let vector = null;
let intensity = null;

function keyPressed() {
  // Crear un polígono con la tecla "1"
  if (key === '1') {
    let x = ui.getRelativeMouseX();
    let y = ui.getRelativeMouseY();
    let box = new Polygon(
      [
        createVector(x - 20, y - 20),
        createVector(x + 20, y - 20),
        createVector(x + 20, y + 20),
        createVector(x - 20, y + 20)
      ],
      0.5,
      'rgba(162, 0, 255, 0.15)',
      'rgba(255, 0, 200, 0.5)',
      false,
      false
    );
    logic.addBodyFromPolygon(box);
  }

  if (key === ' ') {
    let x = ui.getRelativeMouseX();
    let y = ui.getRelativeMouseY();
    bombStartPos = createVector(x, y);
    bomStartTime = millis();
  }
}

function keyReleased() {
  if (key === ' ' && bombStartPos !== null) {
    logic.launchBomb(bombStartPos.x, bombStartPos.y, vector, intensity);
    bombStartPos = null;
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
  logic.doExplosion(x, y, 100);
}

function mouseReleased() {
  ui.mouseReleased();
}

