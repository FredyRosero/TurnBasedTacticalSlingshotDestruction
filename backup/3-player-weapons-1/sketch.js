// ------------------------------
// Variables globales y alias de Matter.js
// ------------------------------
const Engine = Matter.Engine,
  World = Matter.World,
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

// Variable global para el jugador
let player;
// Jugadores (instancias de la clase Player)
let players = [];

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
  world = engine.world;

  // Extraer los polígonos desde el SVG
  let polys = extractPolygonsFromSVG();
  console.log("Polígonos extraídos del SVG:", polys);

  // Creamos la instancia de Terrain con los polígonos extraídos
  terrain = new Terrain(polys);
}

// ------------------------------
// draw: actualiza la simulación y dibuja todo
// ------------------------------
function draw() {
  background(240);
  Engine.update(engine);

  // Dibujar los contornos originales extraídos del SVG
  strokeWeight(6);
  noFill();
  polygons.forEach(polygon => {
    beginShape();
    polygon.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  });

  // Dibujar los cuerpos físicos del terreno
  terrain.show();

  // Dibujar las bombas
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

  // Dibujar el jugador (si existe)
  players.forEach(player => player.draw());

  // Llamamos a la función onKeyIsPressed
  if (player) player.onKeyIsPressed()
}

// ------------------------------
// Función para crear el jugador (spawnPlayer)
// ------------------------------
function spawnPlayer() {
  // Crea el jugador en la posición del mouse
  if (player) {
    // Si ya existe, lo removemos primero (o se puede reiniciar la posición)
    players = players.filter(p => p !== player);
    player.remove();
  }
  player = new Player(mouseX, mouseY);
  players.push(player);
}

// ------------------------------
// keyPressed: 
// - Tecla " " (espacio) crea al jugador
// - Tecla "1" crea una bomba
// - Tecla "2" crea una caja normal
// - "w", "a", "d", "q", "e" controlan el movimiento del jugador
// ------------------------------
function keyPressed() {
  if (key === ' ') {
    spawnPlayer();
  }
  // Si ya existe el jugador, aplicamos controles
  if (player) player.keyPressed(key);
  // Otras teclas para bombas y cajas
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
// mousePressed: al hacer clic, crea un agujero circular en el entorno y actualiza el terreno
// ------------------------------
function mousePressed() {
  let explosion = new Explosion(mouseX, mouseY, 60, 30, 0.08);
  explosion.apply();
  console.log("Explosion disparada en el clic");
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
    this.bodies.forEach(body => World.remove(world, body));
    this.bodies = [];
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
// Clase Explosion: abstrae la mecánica de la explosión (fuerza y deformación)
// ------------------------------
class Explosion {
  constructor(x, y, explosionRadius, explosionHoleRadius, explosionForce) {
    this.x = x;
    this.y = y;
    this.explosionRadius = explosionRadius;         // Radio de efecto de fuerza
    this.explosionHoleRadius = explosionHoleRadius;   // Radio del agujero a sustraer
    this.explosionForce = explosionForce;             // Fuerza base de la explosión
  }

  apply() {
    // Aplicar fuerza a objetos dinámicos
    let bodies = [...boxes, ...bombs.map(b => b.body), ...players.map(p => p.composite)];
    bodies.forEach(body => {
      let d = dist(this.x, this.y, body.position.x, body.position.y);
      if (d < this.explosionRadius) {
        let forceMagnitude = this.explosionForce * (1 - d / this.explosionRadius);
        let direction = createVector(body.position.x - this.x, body.position.y - this.y);
        direction.normalize();
        Matter.Body.applyForce(body, body.position, {
          x: direction.x * forceMagnitude,
          y: direction.y * forceMagnitude
        });
      }
    });

    // Sustrae el agujero del terreno y actualiza los cuerpos
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
    // Parámetros de explosión para la bomba
    this.explosionRadius = 100;
    this.explosionHoleRadius = 50;
    this.explosionForce = 0.12;

    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.5,
      density: 0.1
    });
    World.add(world, this.body);

    // Programar la explosión tras 1 segundo
    setTimeout(() => {
      this.explode();
    }, 1000);
  }

  explode() {
    let pos = this.body.position;
    let explosion = new Explosion(pos.x, pos.y, this.explosionRadius, this.explosionHoleRadius, this.explosionForce);
    explosion.apply();
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
// Clase Player: representa al jugador, con cuerpo y sensor de pies
// ------------------------------
class Player {
  constructor(x, y) {
    this.width = 30;
    this.height = 40;
    this.moveSpeed = 1;
    this.moveForce = 0.02; // Fuerza horizontal de movimiento
    this.jumpForce = 0.04; // Fuerza de salto 
    this.rotationSpeed = 0.1; // Velocidad angular
    // Cuerpo principal
    this.body = Bodies.rectangle(x, y, this.width, this.height);
    // Sensor de pies (para detectar suelo)
    this.feet = Bodies.rectangle(x, y + this.height / 2, this.width / 2, 5, {
      isSensor: true
    });
    // Crear un cuerpo compuesto (Player) que incluye cuerpo y pies
    this.composite = Matter.Body.create({
      parts: [this.body, this.feet],
      restitution: 0.2,
      friction: 1,
      frictionStatic: 1,
      density: 0.18 
    });
    World.add(world, this.composite);
  }

  walk(dir) {
    this.setVelocityX(dir * this.moveSpeed);
  }

  jump() {
    if (this.isGrounded()) {
      this.applyForce({ x: 0, y: -this.jumpForce });
    }
  }

  glide(dir) {
    if (!this.isGrounded()) {
      this.applyForce({ x: dir * this.moveForce, y: 0 });
    }
  }
  
  roll(dir) {
    this.setAngularVelocity(dir * this.rotationSpeed);
  }

  setPosition(x, y) {
    Matter.Body.setPosition(this.composite, { x, y });
  }

  remove() {
    Matter.World.remove(world, this.composite);
  }

  applyForce(force) {
    Matter.Body.applyForce(this.composite, this.composite.position, force);
  }

  setVelocity(velocity) {
    Matter.Body.setVelocity(this.composite, velocity);
  }

  setVelocityX(velocityX) {
    Matter.Body.setVelocity(this.composite, { x: velocityX, y: this.composite.velocity.y });
  }

  setAngularVelocity(velocity) {
    Matter.Body.setAngularVelocity(this.composite, velocity);
  }

  // isGrounded: comprueba si el sensor de pies colisiona con cuerpos estáticos (usamos terrain.bodies)
  isGrounded() {
    let collisions = Matter.Query.collides(this.feet, terrain.bodies);
    return collisions.length > 0;
  }

  draw() {
    push();
    translate(this.composite.position.x, this.composite.position.y);
    rotate(this.composite.angle);
    rectMode(CENTER);
    // Cambia de color según si está en el suelo
    if (this.isGrounded()) fill(155, 0, 0);
    else fill(0, 0, 155);
    rect(0, 0, this.width, this.height);
    // Dibujar el sensor de pies
    fill(0);
    noStroke();
    rect(0, this.height / 2 - 2.5, this.width / 2, 5);
    // Líneas de depuración alrededor del jugador
    strokeWeight(2);
    stroke(0, 255, 0);
    line(-this.width / 2, -this.height / 2, this.width / 2, -this.height / 2); // Arriba
    stroke(255, 0, 255);
    line(-this.width / 2, this.height / 2, this.width / 2, this.height / 2);   // Abajo
    stroke(255, 0, 0);
    line(-this.width / 2, -this.height / 2, -this.width / 2, this.height / 2); // Izquierda
    stroke(0, 255, 255);
    line(this.width / 2, -this.height / 2, this.width / 2, this.height / 2);   // Derecha
    pop();
  }

  onKeyIsPressed() {
    // Update x and y if an arrow key is pressed.
    if (keyIsDown(LEFT_ARROW) === true && this.isGrounded()) {
      player.walk(-1);
    }
    if (keyIsDown(RIGHT_ARROW) === true && this.isGrounded()) {
      player.walk(1);
    }
  }

  keyPressed(key) {
    // Si el jugador está en el suelo, puede saltar
    if (key === 'ArrowUp' && this.isGrounded()) {
      this.jump();
    }
    // Si el jugador esta en el aire puede moverse (aplicar fuerza horizontal)
    if (!this.isGrounded()) {
      if (key === 'ArrowLeft') {
        this.glide(-1);
      }
      if (key === 'ArrowRight') {
        this.glide(1);
      }
    }
    if (key === 'q') {
      this.roll(-1);
    }
    if (key === 'e') {
      this.roll(1);
    }
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
  verts.forEach(v => { sumX += v.x; sumY += v.y; });
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
