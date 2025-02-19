let polyVertices = []; // Vértices del polígono original (p5.Vector)
let triangles = [];    // Triángulos resultantes de la descomposición

function setup() {
  createCanvas(600, 600);
  
  // Definimos un polígono cóncavo (los vértices en orden)
  polyVertices.push(createVector(100, 100));
  polyVertices.push(createVector(300, 50));
  polyVertices.push(createVector(400, 200));
  polyVertices.push(createVector(350, 300));
  polyVertices.push(createVector(250, 250));
  polyVertices.push(createVector(150, 350));
  
  // Triangulamos el polígono usando ear clipping
  triangles = earClipping(polyVertices);
}

function draw() {
  background(220);
  
  // Dibujamos el polígono original (contorno negro)
  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let v of polyVertices) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
  
  // Dibujamos cada triángulo con un color semi-transparente
  stroke(0);
  strokeWeight(1);
  for (let tri of triangles) {
    fill(random(100, 255), random(100, 255), random(100, 255), 150);
    beginShape();
    for (let v of tri) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}

// Algoritmo de Ear Clipping para triangulación
// Asume que el polígono está definido en orden contraclockwise.
function earClipping(polygon) {
  let tris = [];
  // Creamos una copia de los vértices
  let verts = polygon.slice();
  
  // Asegurarse de que los vértices estén en orden contraclockwise
  if (!isCounterClockwise(verts)) {
    verts.reverse();
  }
  
  // Mientras queden más de 3 vértices
  while (verts.length > 3) {
    let earFound = false;
    // Recorremos cada vértice
    for (let i = 0; i < verts.length; i++) {
      let prev = verts[(i - 1 + verts.length) % verts.length];
      let curr = verts[i];
      let next = verts[(i + 1) % verts.length];
      
      // Si el vértice actual forma un ángulo convexo...
      if (isConvex(prev, curr, next)) {
        // ... comprobamos si algún otro vértice está dentro del triángulo (prev, curr, next)
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
          // Si es "oreja", agregamos el triángulo y removemos el vértice actual
          tris.push([prev.copy(), curr.copy(), next.copy()]);
          verts.splice(i, 1);
          earFound = true;
          break; // reiniciamos el bucle
        }
      }
    }
    if (!earFound) {
      // Si no se encuentra ninguna oreja, es posible que el polígono no sea simple
      break;
    }
  }
  // Agregamos el triángulo restante
  if (verts.length === 3) {
    tris.push([verts[0].copy(), verts[1].copy(), verts[2].copy()]);
  }
  return tris;
}

// Función auxiliar para comprobar si tres puntos forman un ángulo convexo
function isConvex(a, b, c) {
  let ab = p5.Vector.sub(b, a);
  let bc = p5.Vector.sub(c, b);
  // Si el producto cruzado es positivo, el ángulo es convexo (para orden contraclockwise)
  let cross = ab.x * bc.y - ab.y * bc.x;
  return cross > 0;
}

// Comprueba si un arreglo de vértices está en orden contraclockwise
function isCounterClockwise(verts) {
  let sum = 0;
  for (let i = 0; i < verts.length; i++) {
    let curr = verts[i];
    let next = verts[(i + 1) % verts.length];
    sum += (next.x - curr.x) * (next.y + curr.y);
  }
  return sum < 0;
}

// Función auxiliar para comprobar si el punto p está dentro del triángulo formado por a, b, c
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
