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
    console.log("updatePhysicsBodies(): polygons input:", this.data.polygons);
    while (this.data.bodies.length) {
      Matter.World.remove(this.world, this.data.bodies.pop());
    }
    this.data.bodies = this.data.polygons.map(polygon => polygonToBody(polygon));
    console.log("updatePhysicsBodies(): bodies output:", this.data.bodies);
    Matter.World.add(this.world, this.data.bodies);
  }

  setPolygons(polygons) {
    this.data.polygons = polygons;
    this.updatePhysicsBodies();
  }

  getPolygons() {
    return this.data.polygons;
  }

}

function polygonToBody(polygon) {
  let vertices = polygon.points.map(p => ({ x: p.x, y: p.y }));
  let centroid = polygon.getCentroid();
  let body = Matter.Bodies.fromVertices(centroid.x, centroid.y, [vertices], {
    isStatic: true
  });
  body.centroid = centroid;
  return body;
}

