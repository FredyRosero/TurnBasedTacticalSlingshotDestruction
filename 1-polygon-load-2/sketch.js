// sketch.js
// ------------------------------
// Variables globales y alias de Matter.js
// ------------------------------
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

let polygons = [];
let engine, world;
let boxes = [];
let staticBodies = [];

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
  updatePhysicsBodies();
  
}

// ------------------------------
// keyPressed: al pulsar espacio, se crea una caja dinámica en la posición del mouse
// ------------------------------
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

  fill(255, 255, 0, 100);
  stroke(255, 255, 0);
  staticBodies.forEach(body => {
    beginShape();
    body.vertices.forEach(v => vertex(v.x, v.y));
    endShape(CLOSE);
  });

  fill(0, 255, 255, 50);
  stroke(255, 0, 255);
  strokeWeight(1);

  staticBodies.forEach(body => {
    body.parts.forEach(part => {
      beginShape();
      part.vertices.forEach(v => vertex(v.x, v.y));
      endShape(CLOSE);
    });
  });

  // Dibujar las cajas dinámicas (rellenas con color)
  strokeWeight(3);
  noStroke();
  fill(100, 100 , 0, 150);
  for (let box of boxes) {
    beginShape();
    for (let v of box.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}

// terrainDeformation.js
function updatePhysicsBodies() {
  // Eliminar cuerpos antiguos
  staticBodies.forEach(body => Matter.World.remove(world, body));
  staticBodies = [];
  // Convertir los polígonos deformados a cuerpos físicos en Matter.js
  polygons.forEach((polygon, i) => {
    let vertices = polygon.map(p => ({ x: p.x, y: p.y }));
    let centroid = getCentroid(vertices);    
    let body = Matter.Bodies.fromVertices(centroid.x, centroid.y, [vertices], {
      isStatic: true
    });
    Matter.World.add(world, body);
    staticBodies.push(body);
  });
  console.log("staticBodies:", staticBodies); 
}

function getCentroid(vertices) {
  let x = 0.0, y = 0.0;
  vertices.forEach(v => {
    x += v.x;
    y += v.y;
  });
  return { x: x / vertices.length, y: y / vertices.length };
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