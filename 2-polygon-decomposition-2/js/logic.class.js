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
    this.updatePhysicsBodies();
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

