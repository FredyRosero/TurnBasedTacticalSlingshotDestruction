const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;

class Logic {
  data;
  engine;
  constructor() {
    //Matter.Common.setDecomp(decomp);
    this.engine = Engine.create(),
      this.world = this.engine.world;
    this.data = {
      bodies: []
    };
  }

  update() {
    Matter.Engine.update(this.engine);
  }

/*   updateBodies() {
    while (this.data.bodies.length) {
      World.remove(this.world, this.data.bodies.pop());
    }
    this.data.bodies = this.data.polygons
      .map(polygon => polygonToBody(polygon))
      .filter(body => body !== null);
    console.log("updatePhysicsBodies:", this.data.bodies);
    this.data.bodies.forEach(body => World.add(this.world, body));
  } */



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


  holeOnCricle(x, y, r) {
    let holeVertices = Polygon.createCirclePath(x, y, 25);    
    let staticBodies = this.data.bodies.filter(b => b.isStatic);
    let nonStaticBodies = this.data.bodies.filter(b => !b.isStatic);    
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
    console.log("addBodyFromPolygon:", body);
    this.addBodyToWorld(body);
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

