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

let engine, world;
let polygons = [];       // Polígonos extraídos desde el SVG
let terrain;             // Terreno destructible
let bombs = [];          // (Si decides seguir usando Bomb, ahora se usan para la granada)
let lasers = [];         // Aquí usaremos las balas de la pistola
let boxes = [];          // Cajas dinámicas

// Jugador
let player;
let players = [];

// Contenido SVG
let terrainSVG = [];

// Parámetros generales
let holeRadius = 30;

// Armas simples (ya no se usan las matemáticas)
let selectedWeapon = ""; // "grenade" o "pistol"

// Velocidad base para proyectiles
let baseSpeed = 20;      // Ajusta según lo necesites

// Variables de la cámara (zoom)
let zoom = 1;
let minZoom = 0.5;
let maxZoom = 3;

// ------------------------------
// Inputs personalizados (ahora se pueden descartar o seguir usándose para depuración)
// ------------------------------
let inputBoxes = []; // Se gestionarán en un array (en este ejemplo, ya no se requieren para definir parámetros)

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
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;

  // En este nuevo esquema, no usamos inputs para parámetros
  // (podrías eliminarlos o usarlos para otros ajustes si lo deseas)
  
  // Extraer los polígonos desde el SVG y crear el terreno
  let polys = extractPolygonsFromSVG();
  console.log("Polígonos extraídos del SVG:", polys);
  terrain = new Terrain(polys);
}

// ------------------------------
// draw: actualiza la simulación y dibuja todo (con zoom centrado en el jugador)
// ------------------------------
function draw() {
  // Forzar landscape en móviles
  if (width < height) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Please rotate your device to landscape", width / 2, height / 2);
    return;
  }
  
  background(240);
  Engine.update(engine);

  push();
  // Aplicar zoom centrado en el jugador
  if (player) {
    let pos = player.body.position;
    translate(pos.x, pos.y);
    scale(zoom);
    translate(-pos.x, -pos.y);
  } else {
    scale(zoom);
  }
  
  // Dibujar los contornos originales (SVG)
  strokeWeight(6);
  noFill();
  polygons.forEach(polygon => {
    beginShape();
    polygon.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  });
  
  terrain.show();
  
  // Dibujar las granadas (bombas)
  bombs.forEach(grenade => grenade.show());
  
  // Dibujar las balas (pistol shots)
  lasers.forEach(bullet => bullet.show());
  
  players.forEach(player => player.draw());
  pop();
  
  fill(0);
  noStroke();
  textSize(16);
  text("Zoom: " + nf(zoom, 1, 2), 20, 50);
  text("Selected Weapon: " + (selectedWeapon || "none"), 20, 70);
}

// ------------------------------
// mouseWheel: controla el zoom de la cámara
// ------------------------------
function mouseWheel(event) {
  zoom = constrain(zoom - event.delta * 0.001, minZoom, maxZoom);
  return false;
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

// ------------------------------
// keyPressed: manejar selección de arma y otros comandos
// ------------------------------
function keyPressed() {
  // Por ejemplo, usa 'g' para granada y 'p' para pistola
  if (key === 'g' || key === 'G') {
    selectedWeapon = "grenade";
    console.log("Grenade selected");
  }
  if (key === 'p' || key === 'P') {
    selectedWeapon = "pistol";
    console.log("Pistol selected");
  }
  if (key === 'Enter') {
    spawnPlayer();
  }
  
  // Delegar controles al jugador
  if (player) {
    player.keyPressed(key);
  }
  
  // Otras teclas para crear elementos (opcional)
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
// mousePressed: usar el mouse para apuntar y disparar
// ------------------------------
function mousePressed() {
  // Si el jugador existe y se ha seleccionado un arma,
  // calcular la dirección desde el jugador hacia el mouse
  if (player && selectedWeapon) {
    let pos = player.composite.position;
    let aim = createVector(mouseX, mouseY);
    let dir = p5.Vector.sub(aim, pos).normalize();
    
    if (selectedWeapon === "grenade") {
      // Lanza una granada con velocidad en la dirección apuntada
      let velocity = p5.Vector.mult(dir, baseSpeed * 0.05); // Ajusta el factor de velocidad
      let grenade = new Grenade(pos.x, pos.y, velocity);
      bombs.push(grenade);
    } else if (selectedWeapon === "pistol") {
      // Dispara una bala desde la pistola
      let velocity = p5.Vector.mult(dir, baseSpeed * 0.2); // La bala se dispara más rápido
      let bullet = new PistolShot(pos.x, pos.y, velocity);
      lasers.push(bullet);
    }
    // Resetear arma seleccionada para evitar disparos múltiples sin volver a seleccionar
    selectedWeapon = "";
  } else {
    // Si no hay arma seleccionada, por ejemplo, disparar una explosión o spawnear jugador
    spawnPlayer();
  }
}

// ------------------------------
// Clases para las armas simples
// ------------------------------

// Clase Grenade: se lanza y explota después de un retardo
class Grenade {
  constructor(x, y, velocity) {
    this.radius = 8;
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0.3,
      density: 0.2
    });
    Matter.Body.setVelocity(this.body, velocity);
    World.add(world, this.body);
    this.hasExploded = false;
    // Explota después de 1.5 segundos
    setTimeout(() => {
      this.explode();
    }, 1500);
  }
  
  explode() {
    if (!this.hasExploded) {
      this.hasExploded = true;
      let pos = this.body.position;
      let explosion = new Explosion(pos.x, pos.y, 120, 60, 1.0);
      explosion.apply();
      World.remove(world, this.body);
      bombs = bombs.filter(b => b !== this);
    }
  }
  
  show() {
    noStroke();
    fill(0, 200, 0);
    let pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}

// Clase PistolShot: proyectil pequeño y rápido con vida corta
class PistolShot {
  constructor(x, y, velocity) {
    this.radius = 3;
    this.body = Bodies.circle(x, y, this.radius, {
      restitution: 0,
      density: 0.001,
      isSensor: true
    });
    Matter.Body.setVelocity(this.body, velocity);
    World.add(world, this.body);
    this.birthTime = millis();
    this.lifeTime = 500; // 0.5 segundos
  }
  
  update() {
    if (millis() - this.birthTime > this.lifeTime) {
      World.remove(world, this.body);
      lasers = lasers.filter(l => l !== this);
    }
  }
  
  show() {
    this.update();
    noStroke();
    fill(255, 255, 0);
    let pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius * 2);
  }
}

// ------------------------------
// Clase Explosion: la misma que ya tienes
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
    let explosionHole = createCirclePath(this.x, this.y, this.explosionHoleRadius);
    terrain.polygons = terrain.polygons.map(polygon => subtractPath(polygon, explosionHole))
      .flat()
      .filter(polygon => polygon.length > 2);
    terrain.updateBodies();
  }
}

// ------------------------------
// Clase Terrain: la misma que ya tienes
// ------------------------------
class Terrain {
  constructor(polygons) {
    this.polygons = polygons;
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
// Clase Player: la misma que ya tienes
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
