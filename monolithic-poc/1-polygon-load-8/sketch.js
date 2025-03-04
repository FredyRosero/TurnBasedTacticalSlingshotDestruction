let polygons = [];

function preload() {
  terrainSVG = loadStrings('assets/terrain.1.svg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (!terrainSVG || terrainSVG.length === 0) {
    console.error("El archivo SVG no se cargó correctamente");
    return;
  }
  polygons = extractPolygonsFromSVG();
  console.log("polygons:", polygons);
}

function draw() {
  
  drawBaseCanvas();
  let legend = `
  In geometry, a set of points is convex if it contains every line 
  segment between two points in the set. Equivalently, a convex set 
  or a convex region is a set that intersects every line in a line 
  segment, single point, or the empty set.[1][2] For example, a 
  solid cube is a convex set, but anything that is hollow or has an 
  indent, for example, a crescent shape, is not convex.
  https://en.wikipedia.org/wiki/Convex_set
  `;
  
  fill(0);
  noStroke();
  textSize(16);
  text(legend,  width / 2, height / 3);
  blendMode(MULTIPLY);
  fill(0,255,255);
  noStroke();
  polygons.forEach(polygon => {
    beginShape();
    polygon.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);
  });
  polygons.forEach(polygon => {
    for (let i = 0; i < polygon.length; i++) {
      for (let j = i + 1; j < polygon.length; j++) {
        stroke(255, 0, 0);
        line(polygon[i].x, polygon[i].y, polygon[j].x, polygon[j].y);
      }
      fill(0, 0, 255);
      noStroke();
      ellipse(polygon[i].x, polygon[i].y, 5, 5);
    }
  });
  blendMode(BLEND);
}

