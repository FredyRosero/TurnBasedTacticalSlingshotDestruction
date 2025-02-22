// ------------------------------
// Variables globales y alias de Matter.js
// ------------------------------
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

let engine, world;

// Polígonos extraídos desde el SVG (cada uno es un arreglo de p5.Vector)
let polygons = [];
// Instancia de Terrain (la clase que encapsula los cuerpos del terreno)
let terrain;
// Bombas (instancias de la clase Bomb)
let bombs = [];
// Cajas dinámicas (instancias en boxes)
let boxes = [];

// Contenido SVG (se cargará desde el archivo en preload)
let terrainSVG = []; 

// Parámetros generales
let holeRadius = 30; // Radio para el agujero al hacer clic

// ------------------------------
// preload: carga el archivo SVG
// ------------------------------
function preload() {
  terrainSVG = loadStrings('assets/terrain.1.svg');
}

// ------------------------------
// setup: inicializa p5.js, Matter.js y crea el terreno
// ------------------------------
function setup() {
  createCanvas(800, 600);
  engine = Engine.create();
  world  = engine.world;
  
  // Extraer los polígonos desde el SVG
  let polys = extractPolygonsFromSVG();
  console.log("Polígonos extraídos del SVG:", polys);
  
  // Crear la instancia de Terrain con los polígonos extraídos
  terrain = new Terrain(polys);
}

// ------------------------------
// draw: actualiza la simulación y dibuja todo
// ------------------------------
function draw() {
  background(240);
  Engine.update(engine);
  
  // Dibujar los contornos originales extraídos del SVG usando el snippet sugerido
  strokeWeight(6);
  noFill();
  polygons.forEach(polygon => {
    beginShape();
    polygon.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  });
  
  // Dibujar los cuerpos físicos del terreno
  terrain.show();
  
  // Dibujar las bombas (llamando a su método show)
  noStroke();
  bombs.forEach(bomb => bomb.show());
  
  // Dibujar las cajas normales
  noStroke();
  fill(0, 150, 0, 150);
  boxes.forEach(box => {
    beginShape();
    box.vertices.forEach(v => vertex(v.x, v.y));
    endShape(CLOSE);
  });
}

// ------------------------------1
// keyPressed:
// - Tecla "1" crea una bomba (instancia de Bomb)
// - Tecla "2" crea una caja normal Body
// ------------------------------
function keyPressed() {
  if (key === '1') {
    let bomb = new Bomb(mouseX, mouseY);
    bombs.push(bomb);
  } else if (key === '2') {
    let box = Bodies.rectangle(mouseX, mouseY, 40, 40, {
      restitution: 0.5,
      density: 0.001
    });
    World.add(world, box);
    boxes.push(box);
  }
}

// ------------------------------
// mousePressed: al hacer clic, crea una explosión en el entorno
// ------------------------------
function mousePressed() {
  // Creamos una explosión usando parámetros específicos para el clic
  // Por ejemplo: radio de fuerza = 60, agujero de 30, fuerza = 0.08
  let explosion = new Explosion(mouseX, mouseY, 60, 30, 0.08);
  explosion.apply();
  console.log("Explosion disparada en el clic");
}

// ------------------------------
// Clase Explosion: abstrae la mecánica de la explosión (fuerza y deformación)
// ------------------------------
class Explosion {
  constructor(x, y, explosionRadius, explosionHoleRadius, explosionForce) {
    this.x = x;
    this.y = y;
    this.explosionRadius = explosionRadius;         // Radio de efecto de fuerza
    this.explosionHoleRadius = explosionHoleRadius;   // Radio del agujero que se sustrae
    this.explosionForce = explosionForce;             // Valor base para la fuerza
  }
  
  apply() {
    // Aplicar fuerza a cajas dinámicas
    boxes.forEach(box => {
      let d = dist(this.x, this.y, box.position.x, box.position.y);
      if (d < this.explosionRadius) {
        let forceMagnitude = this.explosionForce * (1 - d / this.explosionRadius);
        let direction = createVector(box.position.x - this.x, box.position.y - this.y);
        direction.normalize();
        Matter.Body.applyForce(box, box.position, { 
          x: direction.x * forceMagnitude, 
          y: direction.y * forceMagnitude 
        });
      }
    });
    
    // Sustrae el agujero del terreno
    let explosionHole = createCirclePath(this.x, this.y, this.explosionHoleRadius);
    terrain.polygons = terrain.polygons.map(polygon => subtractPath(polygon, explosionHole))
                                        .flat()
                                        .filter(polygon => polygon.length > 2);
    terrain.updateBodies();
  }
}

// ------------------------------
// Clase Bomb: crea una bomba circular (radio 5px) que explota tras 1 segundo usando Explosion
// ------------------------------
class Bomb {
  constructor(x, y) {
    this.radius = 5;
    // Parámetros propios de la bomba para la explosión
    this.explosionRadius = 100;
    this.explosionHoleRadius = 50;
    this.explosionForce = 0.12;
    
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.5,
      density: 0.001
    });
    World.add(world, this.body);
    
    // Programar la explosión tras 1 segundo
    setTimeout(() => {
      this.explode();
    }, 1000);
  }
  
  explode() {
    let pos = this.body.position;
    // Usamos la clase Explosion para aplicar la mecánica
    let explosion = new Explosion(pos.x, pos.y, this.explosionRadius, this.explosionHoleRadius, this.explosionForce);
    explosion.apply();
    
    // Eliminar la bomba del mundo y del array global
    World.remove(world, this.body);
    bombs = bombs.filter(b => b !== this);
  }
  
  show() {
    noStroke();
    fill(100, 100, 0, 150);
    let pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}

// ------------------------------
// Clase Terrain: gestiona los cuerpos físicos del terreno
// ------------------------------
class Terrain {
  constructor(polygons) {
    this.polygons = polygons; // Array de polígonos (cada uno es un array de p5.Vector)
    this.bodies = [];
    this.updateBodies();
  }
  
  updateBodies() {
    // Elimina los cuerpos anteriores del mundo
    this.bodies.forEach(body => World.remove(world, body));
    this.bodies = [];
    
    // Para cada polígono, descomponerlo en triángulos y crear cuerpos
    this.polygons.forEach(poly => {
      let tris = earClipping(poly);
      tris.forEach(tri => {
        let centroid = computeCentroid(tri);
        let localVerts = tri.map(v => ({ x: v.x - centroid.x, y: v.y - centroid.y }));
        let body = Bodies.fromVertices(centroid.x, centroid.y, [localVerts], {
          isStatic: true,
          render: {
            fillStyle: 'transparent',
            strokeStyle: '#000',
            lineWidth: 2
          }
        });
        World.add(world, body);
        this.bodies.push(body);
      });
    });
  }
  
  show() {
    strokeWeight(3);
    stroke(255, 0, 0);
    noFill();
    this.bodies.forEach(body => {
      beginShape();
      body.vertices.forEach(v => vertex(v.x, v.y));
      endShape(CLOSE);
    });
  }
}

// ------------------------------
// createCirclePath: genera un camino circular aproximado (array de p5.Vector)
// ------------------------------
function createCirclePath(cx, cy, r, numSegments = 20) {
  let path = [];
  for (let i = 0; i < numSegments; i++) {
    let angle = map(i, 0, numSegments, 0, TWO_PI);
    path.push(createVector(cx + r * cos(angle), cy + r * sin(angle)));
  }
  return path;
}

// ------------------------------
// subtractPath: sustrae "hole" de "polygon" usando ClipperLib
// ------------------------------
function subtractPath(polygon, hole) {
  let scale = 100;
  let subj = [polygon.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
  let clip = [hole.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
  
  let cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clip, ClipperLib.PolyType.ptClip, true);
  
  let solution = new ClipperLib.Paths();
  cpr.Execute(ClipperLib.ClipType.ctDifference, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
  
  return solution.map(path => path.map(pt => createVector(pt.X / scale, pt.Y / scale)));
}

// ------------------------------
// Funciones auxiliares de triangulación y geometría
// ------------------------------
function computeCentroid(verts) {
  let sumX = 0, sumY = 0;
  verts.forEach(v => {
    sumX += v.x;
    sumY += v.y;
  });
  return createVector(sumX / verts.length, sumY / verts.length);
}

function earClipping(polygon) {
  let tris = [];
  let verts = polygon.slice();
  if (!isCounterClockwise(verts)) { verts.reverse(); }
  
  while (verts.length > 3) {
    let earFound = false;
    for (let i = 0; i < verts.length; i++) {
      let prev = verts[(i - 1 + verts.length) % verts.length];
      let curr = verts[i];
      let next = verts[(i + 1) % verts.length];
      
      if (isConvex(prev, curr, next)) {
        let ear = true;
        for (let j = 0; j < verts.length; j++) {
          if (j === (i - 1 + verts.length) % verts.length ||
              j === i ||
              j === (i + 1) % verts.length) continue;
          if (pointInTriangle(verts[j], prev, curr, next)) {
            ear = false;
            break;
          }
        }
        if (ear) {
          tris.push([prev.copy(), curr.copy(), next.copy()]);
          verts.splice(i, 1);
          earFound = true;
          break;
        }
      }
    }
    if (!earFound) break;
  }
  if (verts.length === 3) { tris.push([verts[0].copy(), verts[1].copy(), verts[2].copy()]); }
  return tris;
}

function isConvex(a, b, c) {
  let ab = p5.Vector.sub(b, a);
  let bc = p5.Vector.sub(c, b);
  return (ab.x * bc.y - ab.y * bc.x) > 0;
}

function isCounterClockwise(verts) {
  let sum = 0;
  for (let i = 0; i < verts.length; i++) {
    let curr = verts[i];
    let next = verts[(i + 1) % verts.length];
    sum += (next.x - curr.x) * (next.y + curr.y);
  }
  return sum < 0;
}

function pointInTriangle(p, a, b, c) {
  let areaOrig = triangleArea(a, b, c);
  let area1 = triangleArea(p, b, c);
  let area2 = triangleArea(a, p, c);
  let area3 = triangleArea(a, b, p);
  return abs(areaOrig - (area1 + area2 + area3)) < 0.1;
}

function triangleArea(a, b, c) {
  return abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2;
}

// ------------------------------
// Funciones para extraer polígonos desde SVG (usando path-data-polyfill)
// ------------------------------
function extractPolygonsFromSVG() {
  let polys = [];
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
    let poly = parsePath(path);
    polys.push(poly);
  }
  return polys;
}

/**
 * parsePath: procesa un elemento <path> y devuelve un arreglo de p5.Vector.
 * Se asume que el atributo "d" usa comandos absolutos (M, L, H, V) o relativos (m, l, h, v).
 */
function parsePath(path) {
  let pathData = path.getPathData();
  let out = [];
  for (let cmd of pathData) {
    if ("MLHVmlhv".indexOf(cmd.type) !== -1) {
      let x, y;
      if (cmd.type === "M" || cmd.type === "L") {
        x = cmd.values[0];
        y = cmd.values[1];
      } else if (cmd.type === "m" || cmd.type === "l") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x + cmd.values[0];
        y = last.y + cmd.values[1];
      } else if (cmd.type === "H" || cmd.type === "h") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = cmd.values[0];
        y = last.y;
      } else if (cmd.type === "V" || cmd.type === "v") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x;
        y = cmd.values[0];
      }
      out.push(createVector(x, y));
    }
  }
  return out;
}
