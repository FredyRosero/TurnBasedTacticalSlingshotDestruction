// Alias de Matter.js
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

let engine, world;
let polyVertices = []; // Vértices del polígono cóncavo original (p5.Vector)
let triangles = [];    // Triángulos (arrays de p5.Vectors) obtenidos con ear clipping
let bodies = [];       // Cuerpos de Matter.js para cada triángulo

function setup() {
  createCanvas(600, 600);
  
  // Inicializamos el motor y el mundo de Matter.js
  engine = Engine.create();
  world  = engine.world;
  
  // Definimos un polígono cóncavo (en orden)
  polyVertices.push(createVector(100, 100));
  polyVertices.push(createVector(300, 50));
  polyVertices.push(createVector(400, 200));
  polyVertices.push(createVector(350, 300));
  polyVertices.push(createVector(250, 250));
  polyVertices.push(createVector(150, 350));
  
  // Descomponemos el polígono en triángulos usando ear clipping
  triangles = earClipping(polyVertices);
  
  // Para cada triángulo, creamos un cuerpo en Matter.js
  for (let tri of triangles) {
    // Calculamos el centroide del triángulo
    let centroid = computeCentroid(tri);
    
    // Convertimos los vértices a coordenadas locales respecto al centroide
    let localVerts = tri.map(v => ({ x: v.x - centroid.x, y: v.y - centroid.y }));
    
    // Creamos el cuerpo a partir de los vértices locales
    // Bodies.fromVertices espera un arreglo de polígonos, por eso usamos [localVerts]
    let body = Bodies.fromVertices(centroid.x, centroid.y, [localVerts], {
      isStatic: true, // Para este ejemplo, los cuerpos son estáticos
      render: {
        fillStyle: 'transparent', // Sin relleno
        strokeStyle: '#000',      // Línea negra
        lineWidth: 2
      }
    });
    
    World.add(world, body);
    bodies.push(body);
  }
}

function draw() {
  background(220);
  
  // Actualizamos el motor de Matter.js
  Engine.update(engine);
  
  // Dibujamos el polígono original (opcional, en gris claro)
  
  strokeWeight(3);
  fill(255, 0, 0, 100);
  stroke(255, 0, 0);
  beginShape();
  for (let v of polyVertices) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
  
  
  // Dibujamos cada cuerpo (polígono descompuesto) recorriendo sus vértices
  strokeWeight(2);
  fill(0, 255, 0, 100);
  stroke(0, 255, 0);
  for (let body of bodies) {
    beginShape();
    for (let v of body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }

  strokeWeight(1);
  
  stroke(0, 0, 255);
  bodies.forEach(body => {
    body.parts.forEach(part => {
      fill(random(100, 255), random(100, 255), random(100, 255), 30);
      beginShape();
      part.vertices.forEach(v => vertex(v.x, v.y));
      endShape(CLOSE);
    });
  });
}

// ----------------------
// Funciones auxiliares
// ----------------------

// Calcula el centroide (promedio de los vértices) de un polígono
function computeCentroid(verts) {
  let sumX = 0, sumY = 0;
  for (let v of verts) {
    sumX += v.x;
    sumY += v.y;
  }
  return createVector(sumX / verts.length, sumY / verts.length);
}

// Algoritmo de ear clipping para descomponer un polígono en triángulos
// Se asume que el polígono es simple y definido en orden (preferiblemente contraclockwise)
function earClipping(polygon) {
  let tris = [];
  let verts = polygon.slice(); // Copia del arreglo
  
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
      
      // Si el ángulo en el vértice actual es convexo
      if (isConvex(prev, curr, next)) {
        let ear = true;
        // Verificar que ningún otro vértice esté dentro del triángulo formado
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
      // Si no se encontró oreja, el polígono puede ser no simple
      break;
    }
  }
  if (verts.length === 3) {
    tris.push([verts[0].copy(), verts[1].copy(), verts[2].copy()]);
  }
  return tris;
}

// Determina si tres puntos forman un ángulo convexo (para orden contraclockwise)
function isConvex(a, b, c) {
  let ab = p5.Vector.sub(b, a);
  let bc = p5.Vector.sub(c, b);
  let cross = ab.x * bc.y - ab.y * bc.x;
  return cross > 0;
}

// Verifica si un arreglo de vértices está en orden contraclockwise
function isCounterClockwise(verts) {
  let sum = 0;
  for (let i = 0; i < verts.length; i++) {
    let curr = verts[i];
    let next = verts[(i + 1) % verts.length];
    sum += (next.x - curr.x) * (next.y + curr.y);
  }
  return sum < 0;
}

// Comprueba si el punto p está dentro del triángulo formado por a, b y c
function pointInTriangle(p, a, b, c) {
  let areaOrig = triangleArea(a, b, c);
  let area1 = triangleArea(p, b, c);
  let area2 = triangleArea(a, p, c);
  let area3 = triangleArea(a, b, p);
  return abs(areaOrig - (area1 + area2 + area3)) < 0.1;
}

// Calcula el área de un triángulo usando la fórmula del determinante
function triangleArea(a, b, c) {
  return abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2;
}
