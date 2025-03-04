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
  let subpolygons = [];
  let hue = 180;
  logic.data.bodies.forEach(body => {
    body.parts.forEach(part => {
      subpolygons.push(new Polygon(
        part.vertices.map(v => createVector(v.x, v.y)),
        0.7,
        `hsla(${hue}, 100%, 50%, 0.1)`,
        `hsla(${hue}, 100%, 50%, 0.7)`,
        true,
        true
      ));
    });
  });
  data = { polygons: [...subpolygons, ...data.polygons] }
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
      'rgba(162, 0, 255, 0.5)',
      'rgba(255, 0, 200, 0.8)',
      false,
      false
    );
    console.log("addTestBox",box);
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
}

function mouseReleased() {
  ui.mouseReleased();
}

