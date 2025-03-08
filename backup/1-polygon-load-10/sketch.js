// sketch.js
// ------------------------------
// Variables globales y alias de Matter.js
// ------------------------------
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;
console.log("decomp :",decomp  )
let polygons = [];
let originalPolygons = [];
let engine, world;
let boxes = [];
let staticBodies = [];
const holeRadius = 30;
let currentSpawnIndex = 0;
let player;
const moveSpeed = 0.01;
const airMoveForce = 0.002;
const jumpForce = 0.035;
const rotationSpeed = 0.1;
let canJump = false;

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
      //restitution: 0.5,
      //density: 0.001
    });
    World.add(world, box);
    boxes.push(box);
  }
}

function draw() {
  background(220);
  
  // Actualizar físicas
  Matter.Engine.update(engine);

  drawStaticBodies();

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

function mousePressed() {
  // Deformar el polígono con un agujero circular en el punto del clic
  let hole = createCirclePath(mouseX, mouseY, holeRadius);
  polygons = polygons.map(polygon => subtractPath(polygon, hole)).flat().filter(polygon => polygon.length > 2);
  console.log("polygons:", polygons);
  updatePhysicsBodies(); // Refrescar los cuerpos en Matter.js
}


// terrainDeformation.js
function updatePhysicsBodies() {
  // Eliminar cuerpos antiguos
  staticBodies.forEach(body => Matter.World.remove(world, body));
  staticBodies = [];

  // Convertir los polígonos deformados a cuerpos físicos en Matter.js
  polygons.forEach((polygon, i) => {
    let vertices = polygon.map(p => ({ x: p.x, y: p.y }));
    // TODO no se alinean
    let centroid = getCentroid(vertices);    
    let body = Matter.Bodies.fromVertices(centroid.x, centroid.y, [vertices], {
      isStatic: true
    });
    
    //Matter.Body.setPosition(body, { x: body.position.x + centre.x, y: body.position.y - centre.y });
    Matter.World.add(world, body);
    staticBodies.push(body);
  });
  console.log("staticBodies:", staticBodies);
  staticBodies.forEach(body => { printBodyPartVertices(body); });
}

function createCirclePath(x, y, radius, numPoints = 20) {
  let path = [];
  for (let i = 0; i < numPoints; i++) {
    let angle = TWO_PI * (i / numPoints);
    path.push({ X: x + cos(angle) * radius, Y: y + sin(angle) * radius });
  }
  return path;
}

function subtractPath(subject, clip) {
  let subjPath = subject.map(p => ({ X: p.x, Y: p.y }));
  let cpr = new ClipperLib.Clipper();
  cpr.AddPath(subjPath, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPath(clip, ClipperLib.PolyType.ptClip, true);
  let solution = new ClipperLib.Paths();
  cpr.Execute(ClipperLib.ClipType.ctDifference, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

  if (solution.length > 0) {
    return solution.map(poly => poly.map(p => createVector(p.X, p.Y)));
  }
  return [];
}

function drawStaticBodies() {

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
}

function getCentroid(vertices) {
  let x = 0.0, y = 0.0;
  vertices.forEach(v => {
    x += v.x;
    y += v.y;
  });
  return { x: x / vertices.length, y: y / vertices.length };
}

printBodyPartVertices = (body) => {
  body.parts.forEach(part => {
    console.log("part.vertices:", part.vertices);
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