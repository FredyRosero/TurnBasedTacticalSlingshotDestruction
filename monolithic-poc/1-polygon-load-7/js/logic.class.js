const Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;
class Logic {
  data;
  engine;
  constructor() {
    //Matter.Common.setDecomp(decomp);
    this.engine = Engine.create(),
    this.world =  this.engine.world;
    this.data = {
      polygons: [],
      bodies: []
    };
  }

  update() {
    Matter.Engine.update(this.engine);      
  }

  updatePhysicsBodies() {
    while (this.data.bodies.length) {
      World.remove(this.world, this.data.bodies.pop());
    }
    this.data.bodies = this.data.polygons
      .map(polygon => polygonToBody(polygon))
      .filter(body => body !== null);
    console.log("updatePhysicsBodies:", this.data.bodies);
    this.data.bodies.forEach(body => World.add(this.world, body));    
  }

  setPolygons(polygons) {
    this.data.polygons = polygons;
    this.triangulatePolygons();
    this.updatePhysicsBodies();
  }

  triangulatePolygons() {
    let newPolygons = [];
    for (let polygon of this.data.polygons) {
      let coords = [];
      polygon.points.forEach(p => {
        coords.push(p.x, p.y);
      });
      let indexTriangledPoints = earcut.default(coords);
      for (let i = 0; i < indexTriangledPoints.length; i += 3) {
        let idx0 = indexTriangledPoints[i];
        let idx1 = indexTriangledPoints[i + 1];
        let idx2 = indexTriangledPoints[i + 2];
        let newPolygon = new Polygon(
          [
            createVector(polygon.points[idx0].x, polygon.points[idx0].y),
            createVector(polygon.points[idx1].x, polygon.points[idx1].y),
            createVector(polygon.points[idx2].x, polygon.points[idx2].y)
          ],
          0.5,
          polygon.fillColor,
          polygon.intenseColor,
          polygon.strokeColor,
          polygon.debug
        );
        newPolygons.push(newPolygon);
      }
    }
    console.log("triangulatePolygons:", newPolygons);
    this.data.polygons = newPolygons;
  }

  getPolygons() {
    return this.data.polygons;
  }

  addPolygon(polygon) {
    this.data.polygons.push(polygon);
    let body = polygonToBody(polygon);
    World.add(this.world, body);
    this.data.bodies.push(body);
  }

}

function polygonToBody(polygon) {
  let vertices = polygon.points.map(p => ({ x: p.x, y: p.y }));
  let centroid = polygon.getCentroid();
  let body = Bodies.fromVertices(centroid.x, centroid.y, [vertices], { isStatic: polygon.isStatic });
  if (!body) return null;
  body.centroid = centroid;
  return body;
}

