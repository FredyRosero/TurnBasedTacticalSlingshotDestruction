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



