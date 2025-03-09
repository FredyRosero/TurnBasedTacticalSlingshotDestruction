import { extractPolygonsFromSVG, PolygonBackend } from './polygon-backend.class.js';
import Matter from 'matter-js';
import path from 'path';
import fs from 'fs';
import earcut from 'earcut';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Player from './player.class.js';

const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;

// Funciones auxiliares para reemplazar las de p5.js
function createVector(x, y) {
  return Matter.Vector.create(x, y);
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function constrain(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// Define una ruta y lee el SVG
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const svgPath = path.join(__dirname, 'assets', 'terrain.1.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8').split('\n');

// Procesa el SVG para extraer los polígonos


class Logic {
  data;
  engine;
  constructor() {
    // Crear el engine con algunas configuraciones para rendimiento
    this.engine = Engine.create({
      enableSleeping: true,
      positionIterations: 5,
      velocityIterations: 3,
      constraintIterations: 2,
    });
    this.world = this.engine.world;
    this.data = {
      bodies: [],
      players: []
    };
    this.players = [];

    this.terrainPolygons = extractPolygonsFromSVG(svgContent);
    console.log("terrainPolygons:", this.terrainPolygons);
    this.init();
  }

  init() {
    this.setTerrain(PolygonBackend.triangulatePolygons(this.terrainPolygons));
  }

  update() {
    Engine.update(this.engine);
    let currentTime = Date.now();
    for (let body of this.data.bodies.slice()) {
      if (body.lifespan && (currentTime - body.birthTime > body.lifespan)) {
        if (body.bomb) {
          this.doExplosion(body.position.x, body.position.y, body.explosionRadius);
        }
        this.removeBodyFromWorld(body);
      }
    }
  }

  /**
   * returns an array of objects with the players' information
   */
  getPlayersInfo() {
    return this.players.map(player => {
      return {
        x: player.composite.position.x,
        y: player.composite.position.y,
        socketId: player.socketId,
        health: player.health
      }
    });
  }

  /**
   * Para cada cuerpo en el mundo, crea un "polígono" a partir de sus vértices.
   * @returns {PolygonBackend[]} Un arreglo de polígonos.
   */
  getPolygonsFromBodies() {
    return this.data.bodies.map(body => {
      let vertices = body.vertices.map(v => createVector(v.x, v.y));
      return new PolygonBackend(vertices, 0.5);
    }).flat();
  }

  doExplosion(x, y, r) {
    let holeVertices = PolygonBackend.createCirclePath(x, y, 25);
    let staticBodies = this.data.bodies.filter(b => b.isStatic);
    let nonStaticBodies = this.data.bodies.filter(b => !b.isStatic);
    // Descomponer terrenos
    let newStaticBodies = [];
    staticBodies.forEach(body => {
      let solutions = PolygonBackend.subtractPath(body.vertices, holeVertices)
        .filter(solutionPoints => solutionPoints.length > 2);
      solutions.forEach(solutionPoints => {
        let triangles = Logic.triangulateVectors(solutionPoints);
        triangles.forEach(t => {
          let centroid = Logic.getCentroid(t);
          let newBody = Bodies.fromVertices(centroid.x, centroid.y, t, { isStatic: true });
          newStaticBodies.push(newBody);
        });
      });
    });
    // Aplicar fuerza a cuerpos no estáticos
    nonStaticBodies.forEach(body => {
      let diffX = body.position.x - x;
      let diffY = body.position.y - y;
      let force = createVector(diffX, diffY);
      let distance = Matter.Vector.magnitude(force);
      if (distance < r) {
        let intensity = map(distance, 0, r, 2, 0);
        let normalizedForce = Matter.Vector.normalise(force);
        let scaledForce = Matter.Vector.mult(normalizedForce, 0.1 * intensity);
        Matter.Body.applyForce(body, body.position, scaledForce);
        if (body.isPlayer) {
          let player = this.getPlayer(body.socketId);
          if (player) {
            player.health -= 10;
            if (player.health <= 0) {
              this.removePlayer(body.socketId);
            }
          }
        }
      }
    });
    let newPolygons = [...newStaticBodies, ...nonStaticBodies];
    this.replaceBodies(newPolygons);
  }

  /**
   * Get the aplyer associated to a socket id
   */
  getPlayer(socketId) {
    return this.players.find(player => player.socketId === socketId);
  }

  addPlayer(data, socketId) {
    console.log("addPlayer.data:", data, "socketId:", socketId);
    let player = new Player(data.x, data.y, socketId);
    this.addBodyToWorld(player.composite);
    this.players.push(player);
  }

  removePlayer(socketId) {
    console.log("removePlayer.socketId:", socketId);
    let player = this.getPlayer(socketId);
    if (player) this.removeBodyFromWorld(player.composite);
    this.players = this.players.filter(p => p !== player);
  }

  /**
   * Triangula un conjunto de puntos usando earcut.
   * @param {Object[]} points - Arreglo de objetos con propiedades x e y.
   * @returns {Object[][]} Arreglo de triángulos (cada uno es un arreglo de 3 vectores).
   */
  static triangulateVectors(points) {
    let triangulatedVectors = [];
    let coords = [];
    points.forEach(p => {
      coords.push(p.x, p.y);
    });
    let indexTriangledPoints = earcut(coords);
    for (let i = 0; i < indexTriangledPoints.length; i += 3) {
      let idx0 = indexTriangledPoints[i];
      let idx1 = indexTriangledPoints[i + 1];
      let idx2 = indexTriangledPoints[i + 2];
      let triangle = [
        createVector(points[idx0].x, points[idx0].y),
        createVector(points[idx1].x, points[idx1].y),
        createVector(points[idx2].x, points[idx2].y)
      ];
      triangulatedVectors.push(triangle);
    }
    return triangulatedVectors;
  }

  static getCentroid(points) {
    let sumX = 0.0, sumY = 0.0;
    points.forEach(v => {
      sumX += v.x;
      sumY += v.y;
    });
    return { x: sumX / points.length, y: sumY / points.length };
  }

  replaceBodies(newBodies) {
    this.removeBodiesFromWorld(this.data.bodies);
    this.addBodiesToWorld(newBodies);
  }

  addBodyFromPolygon(polygon) {
    console.log("addBodyFromPolygon.polygon:", polygon);
    let p = new PolygonBackend(polygon.points, polygon.z);
    let body = polygonToBody(p);
    body.birthTime = Date.now();
    body.lifespan = 7000;
    console.log("addBodyFromPolygon.body:", body);
    this.addBodyToWorld(body);
  }

  launchBomb(x, y, vector, intensity) {
    let body = Bodies.circle(x, y, 5, { isStatic: false });
    const minForce = 0.0001;
    const maxForce = 0.05;
    body.birthTime = Date.now();
    body.lifespan = 4000;
    body.bomb = true;
    body.explosionRadius = 200;
    intensity = constrain(intensity, 0, 1);
    let forceVector = Matter.Vector.mult(vector, map(intensity, 0, 1, minForce, maxForce));
    console.log("launchBomb().forceVector:", forceVector);
    this.addBodyToWorld(body);
    Matter.Body.applyForce(body, body.position, forceVector);
  }

  addBodyToWorld(body) {
    World.add(this.world, body);
    this.data.bodies.push(body);
  }

  addBodiesToWorld(bodies) {
    bodies.forEach(body => this.addBodyToWorld(body));
  }

  removeBodyFromWorld(body) {
    World.remove(this.world, body);
    this.data.bodies = this.data.bodies.filter(b => b !== body);
  }

  removeBodiesFromWorld(bodies) {
    bodies.forEach(body => this.removeBodyFromWorld(body));
  }

  /**
   * Transforma un arreglo de polígonos en cuerpos estáticos de Matter.js.
   * @param {PolygonBackend[]} polygons - Arreglo de polígonos.
   */
  setTerrain(polygons) {
    let staticBodies = polygons.map(polygon => polygonToBody(polygon, true));
    // Ajust the terrain to the center of the canvas
    staticBodies.forEach(body => {
      Matter.Body.translate(body, { x: -600, y: -300 });
    });
    this.addBodiesToWorld(staticBodies);
  }

  /**
   * Resets the whole game
   */
  resetGame() {
    this.removeBodiesFromWorld(this.data.bodies);
    this.players.forEach(player => this.removeBodyFromWorld(player.composite));
    this.players = [];
    this.init();
  }
}

/**
 * Convierte un objeto "polígono" en un cuerpo de Matter.js.
 * Se espera que el objeto polygon tenga un arreglo "points" y un método getCentroid().
 * @param {Object} polygon - El objeto polígono.
 * @param {boolean} [isStatic=false] - Define si el cuerpo es estático.
 * @returns {Matter.Body} Cuerpo creado a partir de los vértices del polígono.
 */
function polygonToBody(polygon, isStatic = false) {
  let vertices = polygon.points.map(p => ({ x: p.x, y: p.y }));
  let centroid = polygon.getCentroid();
  let body = Bodies.fromVertices(centroid.x, centroid.y, [vertices], { isStatic: isStatic });
  return body;
}

export default Logic;
