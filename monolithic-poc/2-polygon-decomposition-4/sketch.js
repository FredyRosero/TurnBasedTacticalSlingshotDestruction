// ------------------------------
// Variables y configuración Matter.js
// ------------------------------
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

let engine, world;

// Arreglos para almacenar polígonos extraídos y sus cuerpos
let svgPolygons = [];  // Cada elemento es un arreglo de p5.Vector (el contorno extraído)
let svgBodies   = [];  // Cuerpos Matter.js creados a partir de la descomposición

// ------------------------------
// Contenido SVG (se puede cargar desde un archivo, aquí lo definimos como array de líneas)
// Contiene tres <path>: triángulo, cuadrado y polígono cóncavo
// ------------------------------
let terrainSVG = [
  `<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <path id="triangle" d="M 50 300 L 100 250 L 150 300 Z" />
      <path id="square" d="M 250 250 L 350 250 L 350 350 L 250 350 Z" />
      <path id="concave" d="M 450 250 L 550 200 L 650 250 L 600 350 L 500 350 Z" />
   </svg>`
];

function setup() {
  createCanvas(800, 600);
  
  // Inicializamos el motor de Matter.js
  engine = Engine.create();
  world  = engine.world;
  
  // Extraemos los polígonos del SVG
  svgPolygons = extractPolygonsFromSVG();
  
  // Para cada polígono extraído, aplicamos ear clipping y creamos cuerpos a partir de cada triángulo
  for (let poly of svgPolygons) {
    let tris = earClipping(poly);
    for (let tri of tris) {
      let centroid = computeCentroid(tri);
      // Convertimos los vértices a coordenadas locales respecto al centroide
      let localVerts = tri.map(v => ({ x: v.x - centroid.x, y: v.y - centroid.y }));
      
      // Creamos el cuerpo con Bodies.fromVertices; el cuerpo se posiciona en el centroide
      let body = Bodies.fromVertices(centroid.x, centroid.y, [localVerts], {
        isStatic: true,
        render: {
          fillStyle: 'transparent',
          strokeStyle: '#000',
          lineWidth: 2
        }
      });
      
      World.add(world, body);
      svgBodies.push(body);
    }
  }
}

function draw() {
  background(240);
  Engine.update(engine);
  
  // Dibujar los contornos originales extraídos del SVG (cada polígono con un color distintivo)
  noFill();
  strokeWeight(3);
  
  if (svgPolygons.length >= 1) {
    // Triángulo: color rojo
    stroke(255, 0, 0, 150);
    beginShape();
    for (let v of svgPolygons[0]) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
  
  if (svgPolygons.length >= 2) {
    // Cuadrado: color azul
    stroke(0, 0, 255, 150);
    beginShape();
    for (let v of svgPolygons[1]) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
  
  if (svgPolygons.length >= 3) {
    // Polígono cóncavo: color morado
    stroke(128, 0, 128, 150);
    beginShape();
    for (let v of svgPolygons[2]) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
  
  // Dibujar los cuerpos físicos (contornos de cada triángulo obtenido)
  strokeWeight(2);
  stroke(0);
  noFill();
  for (let body of svgBodies) {
    beginShape();
    for (let v of body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}

// ------------------------------
// Funciones auxiliares para Matter.js y triangulación
// ------------------------------

// Calcula el centroide (promedio) de un conjunto de vértices (p5.Vector)
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
  let verts = polygon.slice();
  
  // Aseguramos que los vértices estén en orden contraclockwise
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
    if (!earFound) {
      break;
    }
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

// Extrae polígonos (como arreglo de p5.Vector) de un SVG dado en terrainSVG (arreglo de strings)
function extractPolygonsFromSVG() {
  let polygons = [];
  if (!terrainSVG || terrainSVG.length === 0) {
    console.error("No hay contenido SVG para procesar");
    return;
  }
  let parser = new DOMParser();
  // Unimos las líneas del array para formar el contenido completo
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
  return polygons;
}

/**
 * Procesa un elemento <path> y extrae un arreglo de p5.Vector
 * Se asume que el path usa comandos absolutos (M, L, H, V)
 */
function parsePath(path) {
  console.log("Procesando path:", path);
  // Obtenemos el atributo "d" del path
  let d = path.getAttribute("d");
  // Separamos los comandos y sus valores (este es un parser muy simple)
  let commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
  let out = [];
  let lastX = 0, lastY = 0;
  for (let cmd of commands) {
    let type = cmd[0];
    let args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
    if (type === "M" || type === "L") {
      let x = args[0], y = args[1];
      lastX = x; lastY = y;
      out.push(createVector(x, y));
    } else if (type === "m" || type === "l") {
      // Comandos relativos
      let x = lastX + args[0], y = lastY + args[1];
      lastX = x; lastY = y;
      out.push(createVector(x, y));
    } else if (type === "H") {
      // Línea horizontal absoluta
      let x = args[0];
      lastX = x;
      out.push(createVector(x, lastY));
    } else if (type === "h") {
      // Relativa horizontal
      let x = lastX + args[0];
      lastX = x;
      out.push(createVector(x, lastY));
    } else if (type === "V") {
      // Vertical absoluta
      let y = args[0];
      lastY = y;
      out.push(createVector(lastX, y));
    } else if (type === "v") {
      let y = lastY + args[0];
      lastY = y;
      out.push(createVector(lastX, y));
    }
    // Otros comandos se pueden agregar según necesidad
  }
  return out;
}
