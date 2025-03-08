const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;

class Logic {
  data;
  engine;
  constructor() {
    //Matter.Common.setDecomp(decomp);
    this.engine = Engine.create( {
      enableSleeping: true,
      // the higher the value the more accurate the simulation
      positionIterations: 5, //default 6 
      velocityIterations: 3, //default 4
      constraintIterations: 2, //default 2
    }),
      this.world = this.engine.world;
    this.data = {
      bodies: []
    };
  }

  update() {
    Matter.Engine.update(this.engine, 1000 / 15);
    let currentTime = millis();
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
   * For each body in the world, creates a polygon with the vertices of the body
   * @returns {Polygon[]}
   */
  getPolygonsFromBodies() {
    return this.data.bodies.map(body => {
      let vertices = body.vertices.map(v => createVector(v.x, v.y));
      return new Polygon(
        vertices,
        0.5
      );
    }).flat();
  }


  doExplosion(x, y, r) {
    let holeVertices = Polygon.createCirclePath(x, y, 25);    
    let staticBodies = this.data.bodies.filter(b => b.isStatic);
    let nonStaticBodies = this.data.bodies.filter(b => !b.isStatic);    
    // decompose terrains
    let newStaticBodies = []
    staticBodies.forEach(body => {
      let solutions = Polygon.subtractPath(body.vertices, holeVertices).filter(solutionPoints => solutionPoints.length > 2);      
      solutions.forEach(solutionPoints => {
        let triangles = Logic.triangulateVectors(solutionPoints);
        triangles.forEach( t => {
          let centroid = Logic.getCentroid(t);
          let body = Bodies.fromVertices(centroid.x, centroid.y, t, { isStatic: true });
          newStaticBodies.push(body);
        })
      });      
    })
    // apply force to non static bodies
    nonStaticBodies.forEach(body => {
      let force = createVector(body.position.x - x, body.position.y - y);
      let distance = force.mag();
      if (distance < r) {
        let intensity = map(distance, 0, r, 1, 0);
        force.normalize();
        force.mult(0.1 * intensity);
        Matter.Body.applyForce(body, body.position, force);
      }
    });
    let newPolygons = [...newStaticBodies, ...nonStaticBodies];
    this.replaceBodies(newPolygons);
  }

  /**
   * 
   * @param {Vector} points 
   */
  static triangulateVectors(points) {
    let tirangulatedVectores = [];
    let coords = [];
    points.forEach(p => {
      coords.push(p.x, p.y);
    });
    let indexTriangledPoints = earcut.default(coords);
    for (let i = 0; i < indexTriangledPoints.length; i += 3) {
      let idx0 = indexTriangledPoints[i];
      let idx1 = indexTriangledPoints[i + 1];
      let idx2 = indexTriangledPoints[i + 2];
      let triangle = [
        createVector(points[idx0].x, points[idx0].y),
        createVector(points[idx1].x, points[idx1].y),
        createVector(points[idx2].x, points[idx2].y)
      ]
      tirangulatedVectores.push(triangle);
    }
    return tirangulatedVectores;
  }

  static getCentroid(points) {
    let x = 0.0, y = 0.0;
    points.forEach(v => {
      x += v.x;
      y += v.y;
    });
    return { x: x / points.length, y: y / points.length };
  }

  replaceBodies(newBodies) {
    this.removeBodiesFromWorld(this.data.bodies);
    this.addBodiesToWorld(newBodies);
  }

  addBodyFromPolygon(polygon) {
    let body = polygonToBody(polygon);
    body.birthTime = millis();
    body.lifespan = 7000;
    console.log("addBodyFromPolygon:", body);
    this.addBodyToWorld(body);
  }  

  launchBomb(x, y, vector, intensity) {
    let body = Bodies.circle(x, y, 5, { isStatic: false });
    const minForce = 0.0001;
    const maxForce = 0.05;
    body.birthTime = millis();
    body.lifespan = 4000; 
    body.bomb = true; 
    body.explosionRadius = map(intensity, 0, 1, 50, 150);
    intensity = constrain(intensity, 0, 1);
    let forceVector = createVector(vector.x, vector.y).mult(map(intensity, 0, 1, minForce, maxForce));
    console.log("forceVector:", forceVector);
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
   * Transforms a array of polygons into a array of Matter.js static bodies
   * @param {Polygons} polygons 
   */
  setTerrain(polygons) {
    let staticBodies = polygons.map(polygon => polygonToBody(polygon, true));
    this.addBodiesToWorld(staticBodies);
  }

}

/**
 * Converts a polygon object to a Matter.js body.
 * 
 * @param {Object} polygon - The polygon object to convert. Expected to have a points array and getCentroid method.
 * @param {boolean} [isStatic=false] - Whether the resulting body should be static or not.
 * @returns {Matter.Body} A Matter.js body created from the polygon vertices.
 */
function polygonToBody(polygon, isStatic = false) {
  let vertices = polygon.points.map(p => ({ x: p.x, y: p.y }));
  let centroid = polygon.getCentroid();
  let body = Bodies.fromVertices(centroid.x, centroid.y, [vertices], { isStatic: isStatic });
  return body;
}

