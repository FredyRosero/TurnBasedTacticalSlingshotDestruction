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
// Cajas dinámicas que se generan al pulsar la tecla espacio
let boxes = [];

// Contenido SVG (se cargará desde el archivo en preload)
let terrainSVG = []; 

// Radio para el agujero que se crea al hacer clic
let holeRadius = 30;

// ------------------------------
// preload: carga el archivo SVG
// ------------------------------
function preload() {
  // Se carga el archivo SVG (cada línea se guarda en un elemento del array)
  terrainSVG = loadStrings('assets/terrain.1.svg');
}

// ------------------------------
// setup: inicializa p5.js y Matter.js, extrae polígonos del SVG y crea cuerpos
// ------------------------------
function setup() {
  createCanvas(800, 600);
  // Inicializamos el motor y el mundo de Matter.js
  engine = Engine.create();
  world  = engine.world;
  
  // Extraemos los polígonos del SVG
  polygons = extractPolygonsFromSVG();
  console.log("Polígonos extraídos del SVG:", polygons);
  
  // Creamos los cuerpos físicos a partir de los polígonos extraídos
  updatePhysicsBodies();
}

// ------------------------------
// draw: actualiza la simulación y dibuja todo
// ------------------------------
function draw() {
  background(240);
  Engine.update(engine);
  
  // Dibujar los polígonos originales extraídos del SVG (con colores distintivos)
  noFill(); 
  strokeWeight(6);
  polygons.forEach(polygon => {
    beginShape();
    polygon.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  });
  
  // Dibujar los cuerpos físicos (contornos de cada triángulo resultante)
  strokeWeight(3);
  stroke(255, 0, 0);

  //fill(255, 0, 0, 150);
  noFill();
  for (let body of bodies) {
    beginShape();
    for (let v of body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }

  fill(0, 0 , 255, 50);
  stroke(0, 0, 255);
  strokeWeight(1);
  bodies.forEach(body => {
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

// ------------------------------
// mousePressed: al hacer clic, se crea un "agujero" circular en los polígonos y se actualizan los cuerpos
// ------------------------------
function mousePressed() {
  // Creamos un camino circular (polígono) que representa el agujero
  let hole = createCirclePath(mouseX, mouseY, holeRadius);
  // Para cada polígono en "polygons", restamos (clip) el agujero
  // El resultado es un array de polígonos (puede dividirse en varias partes)
  polygons = polygons.map(polygon => subtractPath(polygon, hole))
                     .flat()
                     .filter(polygon => polygon.length > 2);
  console.log("Polígonos después de sustraer el agujero:", polygons);
  // Se actualizan los cuerpos físicos de Matter.js
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

// ------------------------------
// updatePhysicsBodies: elimina los cuerpos actuales y crea nuevos a partir de "polygons"
// ------------------------------
function updatePhysicsBodies() {
  // Eliminar cuerpos anteriores del mundo
  for (let body of bodies) {
    World.remove(world, body);
  }
  bodies = [];
  
  // Para cada polígono en "polygons", se descompone en triángulos y se crean cuerpos
  for (let poly of polygons) {
    let tris = earClipping(poly);
    for (let tri of tris) {
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
    }
  }
}

// ------------------------------
// createCirclePath: devuelve un polígono (arreglo de p5.Vector) que aproxima un círculo
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
// subtractPath: resta "hole" (un polígono) de "polygon" usando ClipperLib
// ------------------------------
function subtractPath(polygon, hole) {
  let scale = 100; // Factor de escala para convertir a enteros
  // Convertir el polígono a formato Clipper (arreglo de objetos {X, Y})
  let subj = [polygon.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
  // Convertir el agujero al mismo formato
  let clip = [hole.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
  
  let cpr = new ClipperLib.Clipper();
  cpr.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(clip, ClipperLib.PolyType.ptClip, true);
  
  let solution = new ClipperLib.Paths();
  cpr.Execute(ClipperLib.ClipType.ctDifference, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
  
  // Convertir de nuevo a arreglo de p5.Vector (dividiendo por scale)
  let result = solution.map(path => path.map(pt => createVector(pt.X / scale, pt.Y / scale)));
  return result;
}

// ------------------------------
// Funciones auxiliares de triangulación y geometría
// ------------------------------

// Calcula el centroide (promedio) de un arreglo de p5.Vector
function computeCentroid(verts) {
  let sumX = 0, sumY = 0;
  for (let v of verts) {
    sumX += v.x;
    sumY += v.y;
  }
  return createVector(sumX / verts.length, sumY / verts.length);
}

// Algoritmo de ear clipping para descomponer un polígono en triángulos
function earClipping(polygon) {
  let tris = [];
  let verts = polygon.slice(); // Copia de los vértices
  
  // Aseguramos que el polígono esté en orden contraclockwise
  if (!isCounterClockwise(verts)) {
    verts.reverse();
  }
  
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
  if (verts.length === 3) {
    tris.push([verts[0].copy(), verts[1].copy(), verts[2].copy()]);
  }
  return tris;
}

function isConvex(a, b, c) {
  let ab = p5.Vector.sub(b, a);
  let bc = p5.Vector.sub(c, b);
  let cross = ab.x * bc.y - ab.y * bc.x;
  return cross > 0;
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
// Funciones para extraer polígonos desde SVG
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
      }
  }

  return out;
}