// Alias de Matter.js
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

let engine, world;

// Declaramos arreglos para cada figura
let triangleVertices = [];
let squareVertices   = [];
let concaveVertices  = [];

let triangleTris = []; // Resultado de ear clipping (para triángulo, será solo el mismo triángulo)
let squareTris   = []; // Para cuadrado (dos triángulos)
let concaveTris  = []; // Para polígono cóncavo (varios triángulos)

let triangleBodies = [];
let squareBodies   = [];
let concaveBodies  = [];

function setup() {
  createCanvas(800, 600);
  
  // Inicializamos el motor y mundo Matter.js
  engine = Engine.create();
  world  = engine.world;
  
  // ------------------------
  // Figura 1: Triángulo
  // ------------------------
  // Definimos un triángulo (convexo, 3 vértices)
  triangleVertices = [
    createVector(100, 150),
    createVector(150, 100),
    createVector(200, 150)
  ];
  // Para un triángulo, earClipping simplemente devuelve el mismo triángulo
  triangleTris = earClipping(triangleVertices);
  // Creamos cuerpos a partir de cada triángulo (en este caso, solo uno)
  for (let tri of triangleTris) {
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
    triangleBodies.push(body);
  }
  
  // ------------------------
  // Figura 2: Cuadrado
  // ------------------------
  // Definimos un cuadrado (convexo, 4 vértices) desplazado a la derecha
  squareVertices = [
    createVector(300, 100),
    createVector(400, 100),
    createVector(400, 200),
    createVector(300, 200)
  ];
  // Aplicamos ear clipping; para un cuadrado se obtiene 2 triángulos
  squareTris = earClipping(squareVertices);
  for (let tri of squareTris) {
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
    squareBodies.push(body);
  }
  
  // ------------------------
  // Figura 3: Polígono cóncavo
  // ------------------------
  // Definimos un polígono cóncavo (6 vértices) desplazado aún más a la derecha
  concaveVertices = [
    createVector(500, 150),
    createVector(650, 100),
    createVector(700, 200),
    createVector(650, 300),
    createVector(550, 250),
    createVector(500, 350)
  ];
  concaveTris = earClipping(concaveVertices);
  for (let tri of concaveTris) {
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
    concaveBodies.push(body);
  }
}

// Función draw: actualiza el motor y renderiza las figuras y sus descomposiciones
function draw() {
  background(240);
  Engine.update(engine);
  
  // Dibujar los contornos originales de cada figura
  noFill();
  strokeWeight(3);
  
  // Triángulo original (rojo)
  stroke(255, 0, 0);
  beginShape();
  for (let v of triangleVertices) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
  
  // Cuadrado original (azul)
  stroke(0, 0, 255);
  beginShape();
  for (let v of squareVertices) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
  
  // Polígono cóncavo original (morado)
  stroke(128, 0, 128);
  beginShape();
  for (let v of concaveVertices) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
  
  // Dibujar los cuerpos de cada figura recorriendo sus partes y vértices
  
  // Para triángulo
  strokeWeight(2);
  stroke(0);
  for (let body of triangleBodies) {
    beginShape();
    for (let v of body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
  
  // Para cuadrado
  for (let body of squareBodies) {
    beginShape();
    for (let v of body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
  
  // Para polígono cóncavo
  for (let body of concaveBodies) {
    beginShape();
    for (let v of body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
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
      // Si no se encontró una "oreja", puede que el polígono no sea simple
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
