// ------------------------------
// Variables globales y alias de Matter.js
// ------------------------------
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

let engine, world;

// Polígonos extraídos desde el SVG (cada uno es un arreglo de p5.Vector)
let polygons = [];
// Cuerpos físicos (resultantes de descomponer cada polígono en triángulos)
let bodies = [];
// Bombas (instancias de la clase Bomb)
let bombs = [];
// Cajas normales (para probar colisiones)
let boxes = [];

// Contenido SVG (se carga desde el archivo en preload)
let terrainSVG = []; 

// Parámetros de la mecánica
let holeRadius = 30;             // Radio para el agujero al hacer clic
let bombExplosionRadius = 50;    // Radio del agujero de la explosión

// ------------------------------
// preload: carga el archivo SVG
// ------------------------------
function preload() {
  terrainSVG = loadStrings('assets/terrain.1.svg');
}

// ------------------------------
// setup: inicializa p5.js y Matter.js, extrae polígonos y crea cuerpos
// ------------------------------
function setup() {
  createCanvas(800, 600);
  engine = Engine.create();
  world  = engine.world;
  
  // Extraer polígonos desde el SVG
  polygons = extractPolygonsFromSVG();
  console.log("Polígonos extraídos del SVG:", polygons);
  
  updatePhysicsBodies();
}

// ------------------------------
// draw: actualiza la simulación y dibuja todo
// ------------------------------
function draw() {
  background(240);
  Engine.update(engine);
  
  // Dibujar contornos originales extraídos del SVG
  noFill();
  strokeWeight(6);
  polygons.forEach(polygon => {
    beginShape();
    polygon.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  });
  
  // Dibujar los cuerpos físicos (los triángulos resultantes de la descomposición)
  strokeWeight(3);
  stroke(255, 0, 0);
  noFill();
  bodies.forEach(body => {
    beginShape();
    body.vertices.forEach(v => vertex(v.x, v.y));
    endShape(CLOSE);
  });
  
  // Dibujar las bombas (usando el método show de la clase Bomb)
  bombs.forEach(bomb => bomb.show());
}

// ------------------------------
// mousePressed: crea un agujero circular en el entorno
// ------------------------------
function mousePressed() {
  let hole = createCirclePath(mouseX, mouseY, holeRadius);
  polygons = polygons.map(polygon => subtractPath(polygon, hole))
                     .flat()
                     .filter(polygon => polygon.length > 2);
  console.log("Polígonos actualizados:", polygons);
  updatePhysicsBodies();
}

// ------------------------------
// keyPressed: al pulsar espacio, se crea una bomba en la posición del mouse
// ------------------------------
function keyPressed() {
  if (key === '1') {
    // Crear bomba en la posición del mouse
    let bomb = new Bomb(mouseX, mouseY);
    bombs.push(bomb);
  } else if (key === '2') {
    // Crear caja normal en la posición del mouse
    let box = Bodies.rectangle(mouseX, mouseY, 40, 40, {
      restitution: 0.5,
      density: 0.001
    });
    World.add(world, box);
    boxes.push(box);
  }
}

// ------------------------------
// Clase Bomb: crea una bomba circular que explota tras 1 segundo
// ------------------------------
class Bomb {
  constructor(x, y) {
    this.radius = 5; // Radio de 5px
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.5,
      density: 0.001
    });
    World.add(world, this.body);
    
    // Programar la explosión en 1 segundo
    setTimeout(() => {
      this.explode();
    }, 1000);
  }
  
  explode() {
    // Obtener la posición actual de la bomba
    let pos = this.body.position;
    // Crear un agujero circular de explosión
    let explosionHole = createCirclePath(pos.x, pos.y, bombExplosionRadius);
    
    // Sustraer el agujero de todos los polígonos y actualizar cuerpos
    polygons = polygons.map(polygon => subtractPath(polygon, explosionHole))
                       .flat()
                       .filter(polygon => polygon.length > 2);
    updatePhysicsBodies();
    
    // Eliminar la bomba del mundo y de la lista
    World.remove(world, this.body);
    bombs = bombs.filter(b => b !== this);
  }
  
  show() {
    // Dibujar la bomba como un círculo
    noStroke();
    fill(100, 100, 0, 150);
    let pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}

// ------------------------------
// updatePhysicsBodies: actualiza los cuerpos en Matter.js según "polygons"
// ------------------------------
function updatePhysicsBodies() {
  bodies.forEach(body => World.remove(world, body));
  bodies = [];
  polygons.forEach(poly => {
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
      bodies.push(body);
    });
  });
}

// ------------------------------
// createCirclePath: genera un camino circular (polígono) aproximado
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
// subtractPath: resta "hole" de "polygon" usando ClipperLib
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
              j === (i + 1) % verts.length)
            continue;
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
