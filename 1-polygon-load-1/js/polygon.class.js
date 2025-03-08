class Polygon {
  points = [];
  fillColor;
  strokeColor;
  centroid;
  debug = false;

  /**
   * Creates a new Polygon instance.
   *
   * @param {Array} points - An array of points defining the polygon's vertices.
   * @param {(string|number)} fill - The fill color value, interpreted by the color() function.
   * @param {(string|number)} stroke - The stroke color value, interpreted by the color() function.
   * @param {boolean} [debug=false] - Optional flag to enable debugging mode.
   */
  constructor(points, fill, stroke, debug = false) {
    this.debug = debug;
    this.fillColor = color(fill);
    this.strokeColor = color(stroke);
    this.intenseColor = color(this.strokeColor.toString());
    colorMode(HSB, 255);
    this.intenseColor = color(hue(this.intenseColor),255,255,245);
    colorMode(RGB, 255);
    this.points = points;
  }

  forEach(labda) {
    this.points.forEach(labda);
  };

  move(x,y) {
    this.forEach(p => p.add(x, y));
  }

  scale(x,y) {
    this.forEach(p => p.mult(x, y));
  }

  getCentroid() {
    let x = 0.0, y = 0.0;
    this.points.forEach(v => {
      x += v.x;
      y += v.y;
    });
    return { x: x / this.points.length, y: y / this.points.length };
  }
  

  draw() {
    push();
    fill(this.fillColor);
    stroke(this.strokeColor);
    beginShape();
    this.forEach(p => vertex(p.x, p.y));
    endShape(CLOSE);  
    if (this.debug) this.drawDebug();
    pop();
  }

  drawDebug(){
    textSize(4);    
    fill(this.intenseColor);
    noStroke();
    for (let i = 0; i < this.points.length; i++) {
      ellipse(this.points[i].x, this.points[i].y, 2, 2);
      text(`(${this.points[i].x.toFixed(1)}, ${this.points[i].y.toFixed(1)})`, this.points[i].x - 5, this.points[i].y + 7);
    }
  }
}

/**
 * Extracts polygons from an SVG string and returns them as an array.
 * 
 * This function parses the provided SVG content, extracts all <path> elements,
 * and converts them into polygon objects using the `parsePath` function.
 * 
 * @returns {Array} An array of polygon objects extracted from the SVG.
 *                  Returns an empty array if no <path> elements are found.
 * 
 * @throws Will log an error message if the SVG content is empty or if no <path> elements are found.
 */
function extractPolygonsFromSVG(svg) {
  let polys = [];
  if (!svg || svg.length === 0) {
    console.error("No hay contenido SVG para procesar");
    return;
  }
  let parser = new DOMParser();
  let svgDoc = parser.parseFromString(svg.join('\n'), "image/svg+xml");
  let svgPaths = svgDoc.getElementsByTagName("path");
  if (svgPaths.length === 0) {
    console.error("No se encontraron elementos <path> en el SVG");
    return;
  }
  for (let svgPath of svgPaths) {
    let hue = random(360).toFixed(0);
    let poly = new Polygon(
      parsePath(svgPath),
      `hsla(${hue}, 100%, 50%, 0.25)`,
      `hsla(${hue}, 100%, 50%, 0.75)`,
      true
    );
    polys.push(poly);
  }
  return polys;
}

/**
 * Parses an SVG path and converts it into an array of vectors.
 * 
 * @requires https://github.com/jarek-foksa/path-data-polyfill
 *
 * @param {SVGPathElement} path - The SVG path element to parse.
 * @returns {Array<{x: number, y: number}>} An array of vectors representing the path.
 */
function parsePath(path) {
  let pathData = path.getPathData();
  let out = [];
  console.log(`Parsing SVG`);
  for (let cmd of pathData) {
    if ("MLHVmlhv".indexOf(cmd.type) !== -1) {
      console.log(`cmd.type: ${cmd.type}, cmd.values: ${cmd.values}`);
      let x, y;
      if (cmd.type === "M" || cmd.type === "L") {
        x = cmd.values[0];
        y = cmd.values[1];
      } else if (cmd.type === "m" || cmd.type === "l") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x + cmd.values[0];
        y = last.y + cmd.values[1];
      } else if (cmd.type === "H") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = cmd.values[0];
        y = last.y;
      } else if (cmd.type === "h") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x + cmd.values[0];
        y = last.y;
      } else if (cmd.type === "V") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x;
        y = cmd.values[0];
      } else if (cmd.type === "v") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x;
        y = last.y + cmd.values[0];
      }
      out.push(createVector(x, y));
    }
  }
  return out;
}