let ui = new UI();

function preload(){  
  ui.preload();
  terrainSVG = loadStrings('https://upload.wikimedia.org/wikipedia/commons/1/1f/Assorted_polygons.svg');
}

function setup() {
  createCanvas(windowWidth, windowHeight,WEBGL);
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
