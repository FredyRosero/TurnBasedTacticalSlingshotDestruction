window.onload = function() {
  this.focus();
  console.log("Focus on the game");
}
// ------------------------------
// Variables globales y alias de Matter.js
// ------------------------------
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies;

// Inputs personalizados para los parámetros de las armas
let inputBoxes = [];

let engine, world;
// Polígonos extraídos desde el SVG (cada uno es un arreglo de p5.Vector)
let polygons = [];
// Instancia de Terrain (la clase que encapsula los cuerpos del terreno)
let terrain;
// Bombas (instancias de la clase Bomb)
let bombs = [];
// Lasers (instancias de la clase Laser)
let lasers = [];
// proyectiles parabólicos
let parabolicBombs = [];
// proyectiles logarítmicos
let logBombs = [];
// proyectiles senoidales
let sinMissiles = [];

// Cajas dinámicas (instancias en boxes)
let boxes = [];

// Variable global para el jugador
let player;
let players = [];

// Contenido SVG (se cargará desde el archivo en preload)
let terrainSVG = [];

// Parámetros generales
let holeRadius = 30; // Radio para el agujero al hacer clic

// Parámetros para el arma de ataque a distancia lineal
let selectedWeapon = ""; // Será "linear" si se selecciona ese arma
let inputM;              // Input para la pendiente (m)

// Parámetros para el disparo
let baseSpeed = 1000;      // Velocidad base del disparo

// Imagen de fondo
let gridImg;

// Variables de la camara
let zoom = 1;
let minZoom = 0.5;
let maxZoom = 3;

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
  // Crear el canvas a pantalla completa
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;

  // Crear inputs para el arma lineal y otras armas y agregarlos al array
  // Input para arma lineal (pendiente m)
  let offsetInputX = 200
  inputBoxes.push(new InputBox(20, offsetInputX + 40, 100, 30, "M"));
  // Inputs para arma parabólica
  inputBoxes.push(new InputBox(150, offsetInputX + 40, 50, 30, "A"));
  inputBoxes.push(new InputBox(210, offsetInputX + 40, 50, 30, "B"));
  // Inputs para arma logarítmica
  inputBoxes.push(new InputBox(20, offsetInputX + 10, 50, 30, "A"));
  inputBoxes.push(new InputBox(80, offsetInputX + 10, 50, 30, "B"));
  // Inputs para arma senoidal
  inputBoxes.push(new InputBox(150, offsetInputX + 10, 50, 30, "A"));
  inputBoxes.push(new InputBox(210, offsetInputX + 10, 50, 30, "F"));

  // Extraer los polígonos desde el SVG
  let polys = extractPolygonsFromSVG();
  console.log("Polígonos extraídos del SVG:", polys);

  // Creamos la instancia de Terrain con los polígonos extraídos
  terrain = new Terrain(polys);

  setupGrid()
}

// ------------------------------
// draw: actualiza la simulación y dibuja todo
// ------------------------------
function draw() {
  // Verificar orientación: si el ancho es menor que la altura, estamos en portrait
  if (width < height) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Please rotate your device to landscape", width / 2, height / 2);
    return; // No continúa con la simulación
  }

  background(240);
  Engine.update(engine);

  // Aplicar transformación de zoom centrada en el jugador, si existe
  push();
  if (player) {
    let pos = player.body.position;
    translate(pos.x, pos.y);
    scale(zoom);
    translate(-pos.x, -pos.y);
  } else {
    scale(zoom);
  }

  // Dibujar la cuadrícula
  drawGrid(); 

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


  fill(0);
  noStroke();
  textSize(16);
  if (selectedWeapon === "linear") {
    text("Arma lineal: y = m * x", 20, 30);
  } else if (selectedWeapon === "parabolic") {
    text("Arma parabólica: y = a*(v0*t)^2 + b*(v0*t) + y0, x = v0*t + x0", 20, 30);
  } else if (selectedWeapon === "logarithmic") {
    text("Arma logarítmica: y = y0 + a * ln(1 + t) + b * t, x = x0 + v0 * t", 20, 30);
  } else if (selectedWeapon === "sinusoidal") {
    text("Arma senoidal: y = y0 + A * sin(2 * PI * f * t), x = x0 + v0 * t", 20, 30);
  } else {
    text("Arma no seleccionada", 20, 30);
  }  

  // Dibujar los lasers
  lasers.forEach(laser => laser.show());

  // Dibujar los proyectiles parabólicos
  parabolicBombs.forEach(pb => pb.show());

  // Dibujar los proyectiles logarítmicos
  logBombs.forEach(lb => lb.show());

  // Dibujar los proyectiles senoidales
  sinMissiles.forEach(sm => sm.show());

  // Dibujar el jugador (si existe)
  players.forEach(player => player.draw());

  // Llamar a onKeyIsPressed para controles continuos del jugador
  if (player) player.onKeyIsPressed();

  // Mostrar nivel de zoom en la UI
  text("Zoom: " + nf(zoom, 1, 2), 20, 50);

  // Dibujar todos los inputs
  for (let input of inputBoxes) {
    input.draw();
  }
}

// ------------------------------
// Función para crear el jugador (spawnPlayer)
// ------------------------------
function spawnPlayer() {
  if (player) {
    players = players.filter(p => p !== player);
    player.remove();
  }
  player = new Player(mouseX, mouseY);
  players.push(player);
}

function keyTyped() {
  for (let input of inputBoxes) {
    input.keyTyped(key);
  }
}

// ------------------------------
// keyPressed:
// ------------------------------
function keyPressed() {
  console.log("Tecla presionada:", key);
  for (let input of inputBoxes) {
    input.keyPressed(keyCode);
  }
  if (key === ' ') {
    if (selectedWeapon === "linear" && player) {
      // Leer la pendiente ingresada en el input
      let m = 1;
      if (isNaN(m)) m = 0;
      // Calcula la dirección con respecto al jugador: (1, m) y normalízala
      let dir = createVector(1, m);
      dir.normalize();
      // Dispara el laser desde la posición del jugador
      let pos = player.composite.position;
      // Parámetros: largo del rayo, radio de efecto de explosión, radio del agujero y fuerza
      let laser = new Laser(pos.x, pos.y, dir, 1000, 100, 50, 1.0);
      lasers.push(laser);
    } else if (selectedWeapon === "parabolic" && player) {
      let a = 1
      let b = 1
      if (isNaN(a)) a = 0;
      if (isNaN(b)) b = 0;
      let pos = player.composite.position;
      let pb = new ParabolicBomb(pos.x, pos.y, baseSpeed, a, b);
      parabolicBombs.push(pb);
    } else if (selectedWeapon === "logarithmic" && player) {
      let a = 1
      let b = 1
      if (isNaN(a)) a = 0;
      if (isNaN(b)) b = 0;
      let pos = player.composite.position;
      let pb = new LogarithmicBomb(pos.x, pos.y, baseSpeed, a, b);
      logBombs.push(pb);
    } else if (selectedWeapon === "sinusoidal" && player) {
      // Leer los parámetros de la trayectoria senoidal
      let A = 1
      let f = 1
      if (isNaN(A)) A = 0;
      if (isNaN(f)) f = 0;
      let pos = player.composite.position;
      let sm = new SinusoidalMissile(pos.x, pos.y, baseSpeed, A, f);
      sinMissiles.push(sm);
    }  
  }
  // Tecla enter para spawnear jugador
  if (key === 'Enter') {
    spawnPlayer();
  }
  // Tecla 'l' para seleccionar el arma lineal
  if (key === 'l' || key === 'L') {
    selectedWeapon = "linear";
    console.log("Arma lineal seleccionada. Ingrese la pendiente (m) en el input.");
  }
  if (key === 'p' || key === 'P') {
    selectedWeapon = "parabolic";
    console.log("Arma parabólica seleccionada. Ingrese parámetros a y b en los inputs.");
  }
  if (key === 'o' || key === 'O') {
    selectedWeapon = "logarithmic";
    console.log("Arma logarítmica seleccionada. Ingrese parámetros a y b en los inputs.");
  }
  if (key === 's' || key === 'S') {
    selectedWeapon = "sinusoidal";
    console.log("Arma senoidal seleccionada. Ingrese parámetros A y f en los inputs.");
  }
  // Delegar controles al jugador si existe
  if (player) {
    player.keyPressed(key);
  }
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
// mousePressed: al hacer clic, crea una explosión en el entorno
// ------------------------------
function mousePressed() {
  for (let input of inputBoxes) {
    input.mousePressed(mouseX, mouseY);
  }
  let explosion = new Explosion(mouseX, mouseY, 60, 30, 0.08);
  explosion.apply();
  console.log("Explosion disparada en el clic");
}

// ------------------------------
// mouseWheel: controla el zoom de la cámara
// ------------------------------
function mouseWheel(event) {
  // Ajusta el zoom según el delta de la rueda (ajusta el factor de multiplicación según sea necesario)
  zoom = constrain(zoom - event.delta * 0.001, minZoom, maxZoom);
  console.log("Zoom actual:", zoom);
  // Prevenir el scroll por defecto del navegador
  return false;
}

// ------------------------------
// Clase Explosion: abstrae la mecánica de la explosión (fuerza y deformación)
// ------------------------------
class Explosion {
  constructor(x, y, explosionRadius, explosionHoleRadius, explosionForce) {
    this.x = x;
    this.y = y;
    this.explosionRadius = explosionRadius;
    this.explosionHoleRadius = explosionHoleRadius;
    this.explosionForce = explosionForce;
  }

  apply() {
    // Aplicar fuerza a objetos dinámicos (cajas, bombas, jugadores)
    let affectedBodies = [
      ...boxes,
      ...bombs.map(b => b.body),
      ...players.map(p => p.composite)
    ];
    affectedBodies.forEach(body => {
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
    // Modificar el terreno: sustrae el agujero y actualiza cuerpos
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
  // Ahora el constructor acepta opcionalmente un vector de velocidad inicial
  constructor(x, y, velocity) {
    this.radius = 5;
    this.explosionRadius = 100;
    this.explosionHoleRadius = 50;
    this.explosionForce = 1.0;
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.5,
      density: 0.1
    });
    if (velocity) {
      Matter.Body.setVelocity(this.body, velocity);
    }
    World.add(world, this.body);
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
// Clase Player: representa al jugador, con cuerpo y sensor de pies
// ------------------------------
class Player {
  constructor(x, y) {
    this.width = 30;
    this.height = 30;
    this.moveSpeed = 1;
    this.moveForce = 0.01;
    this.jumpForce = 0.5;
    this.rotationSpeed = 0.05;
    this.doubleJump = false;
    this.body = Bodies.circle(x, y, this.height/2, {
      render: { fillStyle: "#FCED08" }
    });
    this.feet = Bodies.rectangle(x, y + this.height/2 - 5, 5, 5, {
      isSensor: true,
      density: 0.8
    });
    this.composite = Matter.Body.create({ 
      parts: [this.body, this.feet],
      restitution: 0.0001,
      friction: 0.1,
      frictionStatic: 0.1,
      density: 0.3,
      slop: 0.1
    });
    Matter.Body.setCentre(this.composite, { x: 0, y: -this.height/4 }, true);
    World.add(world, this.composite);
  }

  walk(dir) {
    if (this.isGrounded()) {
      this.setVelocityX(dir * this.moveSpeed);
      Matter.Body.setAngularVelocity(this.composite, 0, false);
    }
  }

  jump() {
    if (!this.isOnAir()) {
      this.doubleJump = true;
      this.applyForce({ x: 0, y: -this.jumpForce });
    } else if (this.doubleJump) {
      this.doubleJump = false;
      this.applyForce({ x: 0, y: -this.jumpForce/2 });
    }
  }

  glide(dir) {
    if (this.isOnAir()) {
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
    this.setVelocity({ x: velocityX, y: this.composite.velocity.y });
  }

  setAngularVelocity(velocity) {
    Matter.Body.setAngularVelocity(this.composite, velocity);
  }

  isGrounded() {
    // Para simplificar, consideramos que está grounded si el ángulo del composite es cercano a 0
    const angle = this.composite.angle % TWO_PI;
    return angle < PI/4 && angle > -PI/4;
  }

  isOnAir() {
    let collisions = Matter.Query.collides(this.body, terrain.bodies);
    return collisions.length === 0;
  }

  draw() {
    push();
    translate(this.body.position.x, this.body.position.y);
    // Cambia de color según si está en el suelo o en el aire
    if (this.isGrounded()) fill(155, 0, 0);
    else if (this.isOnAir()) fill(155, 155, 0);
    else fill(0, 0, 155);
    beginShape();
    this.body.vertices.forEach(v => vertex(v.x - this.composite.position.x, v.y - this.composite.position.y));
    endShape(CLOSE);
    fill(0);
    noStroke();
    beginShape();
    this.feet.vertices.forEach(v => vertex(v.x - this.composite.position.x, v.y - this.composite.position.y));
    endShape(CLOSE); 
    stroke(0, 255, 0);
    noFill();
    beginShape();
    this.composite.vertices.forEach(v => vertex(v.x - this.composite.position.x, v.y - this.composite.position.y));
    endShape(CLOSE);
    pop();
  }

  onKeyIsPressed() {
    if (keyIsDown(LEFT_ARROW)) {
      player.walk(-1);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      player.walk(1);
    }
  }

  keyPressed(key) {
    if (key === 'ArrowUp') {
      this.jump();
    }
    if (this.isOnAir()) {
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
// Funciones auxiliares para geometría, triangulación y extracción de SVG
// ------------------------------
function createCirclePath(cx, cy, r, numSegments = 20) {
  let path = [];
  for (let i = 0; i < numSegments; i++) {
    let angle = map(i, 0, numSegments, 0, TWO_PI);
    path.push(createVector(cx + r * cos(angle), cy + r * sin(angle)));
  }
  return path;
}

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

class Laser {
  /**
   * @param {number} x - Posición de inicio (desde el jugador)
   * @param {number} y - Posición de inicio
   * @param {p5.Vector} direction - Vector dirección (normalizado)
   * @param {number} rayLength - Largo máximo del rayo
   * @param {number} explosionRadius - Radio en el que se aplica fuerza
   * @param {number} explosionHoleRadius - Radio del agujero que se sustrae
   * @param {number} explosionForce - Fuerza base de la explosión
   */
  constructor(x, y, direction, rayLength, explosionRadius, explosionHoleRadius, explosionForce) {
    this.start = createVector(x, y);
    // invertir el componente y para que el rayo vaya hacia arriba
    this.direction = createVector(direction.x, -direction.y);
    
    this.rayLength = rayLength;
    this.explosionRadius = explosionRadius;
    this.explosionHoleRadius = explosionHoleRadius;
    this.explosionForce = explosionForce;
    this.rayWidth = 1; // ancho del rayo para la consulta

    // Calcular el punto final "intended" del rayo
    let v = p5.Vector.mult(this.direction, this.rayLength)
    this.intendedEnd = p5.Vector.add(this.start, v);
    console.log("Punto final del rayo:", this.intendedEnd);
    
    // Realizar la consulta de rayo contra los cuerpos del terreno
    let collisions = Matter.Query.ray(terrain.bodies, this.start, this.intendedEnd, this.rayWidth);
    if (collisions.length > 0) {
      // Seleccionar la colisión más cercana
      let minDist = Infinity;
      let closestPoint = null;
      collisions.forEach(collision => {
        let pt = collision.supports[0];
        let d = dist(this.start.x, this.start.y, pt.x, pt.y);
        if (d < minDist) {
          minDist = d;
          closestPoint = pt;
        }
      });
      this.end = createVector(closestPoint.x, closestPoint.y);
    } else {
      this.end = this.intendedEnd;
    }
    
    // Aplicar la explosión de inmediato en el punto final del rayo
    let explosion = new Explosion(this.end.x, this.end.y, this.explosionRadius, this.explosionHoleRadius, this.explosionForce);
    explosion.apply();
    
    // Programar la eliminación del laser tras 0.1 segundo
    setTimeout(() => {
      lasers = lasers.filter(l => l !== this);
    }, 100);
  }
  
  show() {
    stroke(255, 0, 0);
    strokeWeight(4);
    line(this.start.x, this.start.y, this.end.x, this.end.y);
  }
}

// ------------------------------
// Clase ParabolicBomb: proyectil que sigue una trayectoria parabólica definida por los parámetros
// ------------------------------
class ParabolicBomb {
  constructor(x, y, baseSpeed, a, b) {
    this.radius = 5;
    this.initialPos = createVector(x, y);
    this.launchTime = millis();
    this.baseSpeed = baseSpeed; // velocidad horizontal base
    this.a = -a; // parámetro cuadrático
    this.b = -b; // parámetro lineal
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.5,
      density: 0.1
    });
    World.add(world, this.body);
    this.hasExploded = false;
  }
  
  update() {
    let t = (millis() - this.launchTime) / 1000; // tiempo en segundos
    let newX = this.initialPos.x + this.baseSpeed * t;
    let newY = this.initialPos.y + this.a * Math.pow(this.baseSpeed * t, 2) + this.b * (this.baseSpeed * t);
    let desiredPos = createVector(newX, newY);
    Matter.Body.setPosition(this.body, desiredPos);
    
    // Si se sale de los límites o hay colisión, explota
    if (desiredPos.x > width || desiredPos.y > height || desiredPos.y < 0) {
      this.explode();
    }
    let collisions = Matter.Query.collides(this.body, terrain.bodies);
    if (collisions.length > 0 && !this.hasExploded) {
      this.explode();
    }
  }
  
  explode() {
    if (!this.hasExploded) {
      this.hasExploded = true;
      let pos = this.body.position;
      let explosion = new Explosion(pos.x, pos.y, 100, 50, 1.0);
      explosion.apply();
      World.remove(world, this.body);
      parabolicBombs = parabolicBombs.filter(pb => pb !== this);
    }
  }
  
  show() {
    this.update();
    noStroke();
    fill(0, 0, 255, 150);
    let pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}

// Clase LogarithmicBomb: proyectil que sigue una trayectoria logarítmica
class LogarithmicBomb {
  /**
   * @param {number} x - Posición inicial (del jugador)
   * @param {number} y - Posición inicial
   * @param {number} baseSpeed - Velocidad horizontal base (v0)
   * @param {number} a - Parámetro de la función logarítmica (afecta la curvatura vertical)
   * @param {number} b - Parámetro lineal que ajusta la inclinación
   */
  constructor(x, y, baseSpeed, a, b) {
    this.radius = 5;
    this.initialPos = createVector(x, y);
    this.launchTime = millis();
    this.baseSpeed = baseSpeed;
    this.a = -a;
    this.b = -b;
    // Creamos el cuerpo del proyectil
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.5,
      density: 0.1
    });
    World.add(world, this.body);
    this.hasExploded = false;
  }
  
  update() {
    // Tiempo transcurrido en segundos desde el lanzamiento
    let t = (millis() - this.launchTime) / 1000;
    // Calcula la posición horizontal: desplazamiento lineal
    let x = this.initialPos.x + this.baseSpeed * t;
    // Calcula la posición vertical usando la función logarítmica:
    // y = y0 + a * ln(1 + t) + b * t
    let y = this.initialPos.y + this.a * log(1 + t) + this.b * t;
    let desiredPos = createVector(x, y);
    Matter.Body.setPosition(this.body, desiredPos);
    
    // Si el proyectil se sale de los límites o colisiona con el terreno, explota
    if (desiredPos.x > width || desiredPos.y > height || desiredPos.y < 0) {
      this.explode();
    }
    let collisions = Matter.Query.collides(this.body, terrain.bodies);
    if (collisions.length > 0 && !this.hasExploded) {
      this.explode();
    }
  }
  
  explode() {
    if (!this.hasExploded) {
      this.hasExploded = true;
      let pos = this.body.position;
      // Usamos los mismos parámetros de explosión que en otras explosiones (puedes ajustarlos)
      let explosion = new Explosion(pos.x, pos.y, 100, 50, 1.0);
      explosion.apply();
      World.remove(world, this.body);
      logBombs = logBombs.filter(lb => lb !== this);
    }
  }
  
  show() {
    this.update();
    noStroke();
    fill(0, 0, 255, 150);
    let pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}

class SinusoidalMissile {
  constructor(x, y, baseSpeed, amplitude, frequency) {
    this.radius = 5;
    this.initialPos = createVector(x, y);
    this.launchTime = millis();
    this.baseSpeed = baseSpeed;  // velocidad horizontal base
    this.amplitude = -amplitude;  // Amplitud A
    this.frequency = frequency;  // Frecuencia f (en Hz)
    
    // Creamos el cuerpo del proyectil
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.5,
      density: 0.1
    });
    World.add(world, this.body);
    this.hasExploded = false;
  }
  
  update() {
    let t = (millis() - this.launchTime) / 1000; // tiempo en segundos
    let newX = this.initialPos.x + this.baseSpeed * t;
    // Calcula la posición vertical: desplazamiento senoidal
    let newY = this.initialPos.y + this.amplitude * sin(2 * PI * this.frequency * t);
    let desiredPos = createVector(newX, newY);
    Matter.Body.setPosition(this.body, desiredPos);
    
    // Si se sale de los límites o colisiona, explota
    if (desiredPos.x > width || desiredPos.y > height || desiredPos.y < 0) {
      this.explode();
    }
    let collisions = Matter.Query.collides(this.body, terrain.bodies);
    if (collisions.length > 0 && !this.hasExploded) {
      this.explode();
    }
  }
  
  explode() {
    if (!this.hasExploded) {
      this.hasExploded = true;
      let pos = this.body.position;
      let explosion = new Explosion(pos.x, pos.y, 100, 50, 1.0);
      explosion.apply();
      World.remove(world, this.body);
      sinMissiles = sinMissiles.filter(sm => sm !== this);
    }
  }
  
  show() {
    this.update();
    noStroke();
    fill(0, 0, 255, 150);
    let pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}


function setupGrid(){
  // Crear un buffer para la cuadrícula con el mismo tamaño que el canvas
  let gridBuffer = createGraphics(width, height);
  gridBuffer.clear();
  gridBuffer.push();
  // Queremos que el centro de la cuadrícula sea el centro del buffer,
  // y luego lo trasladaremos para que coincida con la posición del jugador.
  gridBuffer.translate(width / 2, height / 2);
  

  gridBuffer.fill(0);
  let fontSizeBig = 14;  
  let fontSizeSmall = 8;

  // Dibujar líneas verticales
  gridBuffer.stroke(0, 0, 0, 50);
  for (let x = -width; x <= width; x += 50) {
    if (x % 200 === 0) {
      gridBuffer.strokeWeight(2);
      gridBuffer.stroke(150);
      gridBuffer.textSize(fontSizeBig);      
    } else {      
      gridBuffer.strokeWeight(1);
      gridBuffer.stroke(220);
      gridBuffer.textSize(fontSizeSmall);
    }
    gridBuffer.text(x, x, 0);
    gridBuffer.line(x, -height, x, height);
    
  }
  
  // Dibujar líneas horizontales
  for (let y = -height; y <= height; y += 50) {
    if (y % 200 === 0) {
      gridBuffer.strokeWeight(2);
      gridBuffer.stroke(150);
      gridBuffer.textSize(fontSizeBig);       
    } else {
      gridBuffer.strokeWeight(1);
      gridBuffer.stroke(220);
      gridBuffer.textSize(fontSizeSmall);
    }
    gridBuffer.text(y, 0, y);
    gridBuffer.line(-width, y, width, y);
  }
  
  // Dibujar ejes
  gridBuffer.stroke(255, 0, 0, 50);
  gridBuffer.strokeWeight(3);
  gridBuffer.line(-width, 0, width, 0);
  gridBuffer.stroke(0, 0, 255, 50);
  gridBuffer.strokeWeight(3);
  gridBuffer.line(0, -height, 0, height);
  gridBuffer.pop();
  
  // Crear un buffer para la máscara
  let maskBuffer = createGraphics(width, height);
  maskBuffer.clear();
  maskBuffer.push();
  maskBuffer.background(0,0,0,0);
  maskBuffer.stroke(255);
  maskBuffer.strokeWeight(1);
  maskBuffer.fill(255);
  maskBuffer.ellipse(width / 2, height / 2, 800, 800);
  maskBuffer.pop();
  
  // Obtener la imagen de la cuadrícula y aplicar la máscara
  gridImg = gridBuffer.get();  
  gridImg.mask(maskBuffer.get());

}


/**
 * Dibuja un plano cartesiano con una cuadrícula de 10x10 donde el centro es el jugador
 */
function drawGrid() {
  if (!player) return;    
  // Dibujar la cuadrícula enmascarada, de modo que su centro coincida con la posición del jugador
  let pos = player.body.position;
  
  image(gridImg, pos.x - width / 2, pos.y - height / 2);
}

// Clase InputBox para entrada de texto dentro del canvas
class InputBox {
  constructor(x, y, w, h, placeholder = "") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.placeholder = placeholder;
    this.value = "";
    this.active = false;
  }
  
  draw() {
    stroke(0);
    strokeWeight(1);
    // Color de fondo según esté activo o no
    fill(this.active ? 255 : 240);
    rect(this.x, this.y, this.w, this.h);
    
    noStroke();
    fill(0);
    textSize(16);
    textAlign(LEFT, CENTER);
    let displayText = this.value.length > 0 ? this.value : this.placeholder;
    text(displayText, this.x + 5, this.y + this.h / 2);
  }
  
  keyTyped(keyChar) {
    if (this.active) {
      // Considera que keyTyped no captura teclas especiales como Backspace.
      this.value += keyChar;
    }
  }
  
  keyPressed(keyCode) {
    if (this.active && keyCode === BACKSPACE) {
      this.value = this.value.slice(0, -1);
    }
  }
  
  mousePressed(mx, my) {
    // Activar si el clic está dentro del rectángulo; de lo contrario, desactivar.
    if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
      this.active = true;
    } else {
      this.active = false;
    }
    console.log("InputBox activado:", this.active);
  }
}
