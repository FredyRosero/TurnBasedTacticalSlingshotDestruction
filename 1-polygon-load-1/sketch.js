// sketch.js
// ------------------------------
// Variables globales y alias de Matter.js
// ------------------------------
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

let polygons = [];
let engine, world;
  
function preload() {
  // Cargar el archivo SVG
  terrainSVG = loadStrings('assets/terrain.1.svg');
}

function setup() {
  if (!terrainSVG || terrainSVG.length === 0) {
    console.error("El archivo SVG no se cargó correctamente");
    return;
  }  
  createCanvas(600, 600);
  // Inicializar motor de físicas
  engine = Matter.Engine.create();
  world = engine.world;
  Matter.Common.setDecomp(decomp);
  // Inicializar polígonos deformables
  extractPolygonsFromSVG();
  console.log("polygons:", polygons);
  
}

function draw() {
  background(220);
  
  // Actualizar físicas
  Matter.Engine.update(engine);

  // Dibujar polígonos deformables con coordenadas ajustadas y contornos
  fill(255, 0, 0, 100);
  stroke(0, 255, 0);
  strokeWeight(2);
  polygons.forEach(polygon => {
    beginShape();
    polygon.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  });
}

function extractPolygonsFromSVG() {
  if (!terrainSVG || terrainSVG.length === 0) {
      console.error("No hay contenido SVG para procesar");
      return;
  }
  let parser = new DOMParser();
  let svgDoc = parser.parseFromString(terrainSVG.join('\n'), "image/svg+xml");
  let paths = svgDoc.getElementsByTagName("path");
  if (paths.length === 0) {
      console.error("No se encontraron elementos <path> en el SVG");
      return;
  }
  for (let path of paths) {
      let polygon = parsePath(path);
      polygons.push(polygon);
  }
}

/**
* The path should use Absuolte format
*/
function parsePath(path) {
  console.log("Procesando path:", path);
  var pathdata = path.getPathData();
  var i = 0,
      out = [],
      data,
      vector,
      type;
  for (; i < pathdata.length; i++) {
      type = pathdata[i].type;
      data = {};
      switch (type) {
          case 'M':
          case 'm':
          case 'l':
          case 'L':
              data.x = pathdata[i].values[0];
              data.y = pathdata[i].values[1];
              break;
          case 'H':
          case 'h':
              data.x = pathdata[i].values[0];
              data.y = pathdata[i - 1].values[1];
          case 'V':
          case 'v':
              data.x = pathdata[i - 1].values[0];
              data.y = pathdata[i].values[1];
      }
      if (['M', 'm', 'l', 'L', 'H', 'h', 'V', 'v'].indexOf(type) !== -1) {
          vector = createVector(data.x, data.y);
          out.push(vector);
          console.log(data, pathdata[i], vector);
      }
  }
  return out;
}