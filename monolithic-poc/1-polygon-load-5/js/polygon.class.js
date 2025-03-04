class Polygon {

  static shader = null;
  static strokeShader = null;

  static preload() {
    Polygon.shader = loadShader('glsl/polygonVertexShader.vert', 'glsl/polygonFragmentShader.frag');
    console.log("Polygon.shader:", Polygon.shader);
  }

  static setup() {
    Polygon.strokeShader = baseStrokeShader().modify(polygonStrokeShader);
  }

  points = [];
  fillColor;
  strokeColor;
  centroid;
  debug = false;

  /**
   * Creates a new Polygon instance.
   *
   * @param {Array} points - An array of points defining the polygon's vertices.
   * @param {float} z - The z value of the polygon.
   * @param {(string|number)} fill - The fill color value, interpreted by the color() function.
   * @param {(string|number)} stroke - The stroke color value, interpreted by the color() function.
   * @param {boolean} [debug=false] - Optional flag to enable debugging mode.
   */
  constructor(points, z, fill, stroke, debug = false) {
    this.points = points;
    this.z = z;
    this.debug = debug;
    this.fillColor = color(fill);
    this.fillColorArray = [red(this.fillColor) / 255, green(this.fillColor) / 255, blue(this.fillColor) / 255, alpha(this.fillColor) / 255];
    this.strokeColor = color(stroke);
    this.strokeColorArray = [red(this.strokeColor) / 255, green(this.strokeColor) / 255, blue(this.strokeColor) / 255, alpha(this.strokeColor) / 255];

    colorMode(HSB, 255);
    this.intenseColor = color(fill.toString());
    this.intenseColor = color(hue(this.intenseColor), 255, 255, 255);    
    this.intenseColorArray = [red(this.intenseColor) / 255, green(this.intenseColor) / 255, blue(this.intenseColor) / 255, alpha(this.intenseColor) / 255];
    colorMode(RGB, 255);

    console.log("Polygon.constructor():\n", z, this.fillColor, this.intenseColor, this.strokeColor, points, debug);
  }

  forEach(labda) {
    this.points.forEach(labda);
  };

  move(x, y) {
    this.forEach(p => p.add(x, y));
  }

  scale(x, y) {
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
    shader(Polygon.strokeShader);
    stroke(this.strokeColor);
    fill(this.fillColor);
    shader(Polygon.shader);

    let coords = [];
    this.points.forEach(p => {
      coords.push(p.x, p.y);
    });
    let triangledPoints = earcut.default(coords);

    if (this.debug) this.drawDebug();

    push();
    Polygon.shader.setUniform("uColor", this.strokeColorArray);
    beginShape(LINES);
    for (let i = 0; i < triangledPoints.length; i += 3) {
      let idx0 = triangledPoints[i];
      let idx1 = triangledPoints[i + 1];
      let idx2 = triangledPoints[i + 2];

      vertex(this.points[idx0].x, this.points[idx0].y, this.z);
      vertex(this.points[idx1].x, this.points[idx1].y, this.z);

      vertex(this.points[idx1].x, this.points[idx1].y, this.z);
      vertex(this.points[idx2].x, this.points[idx2].y, this.z);

      vertex(this.points[idx2].x, this.points[idx2].y, this.z);
      vertex(this.points[idx0].x, this.points[idx0].y, this.z);
    }
    endShape();
    pop();

    push();
    Polygon.shader.setUniform("uColor", this.fillColorArray);
    beginShape(TRIANGLES);
    for (let i = 0; i < triangledPoints.length; i++) {
      let idx = triangledPoints[i];
      vertex(this.points[idx].x, this.points[idx].y, this.z, 0.5, 0.5);
    }
    endShape();
    pop();
  }


  drawDebug() {
    push();
    textSize(4);    
    Polygon.shader.setUniform("uColor", this.strokeColorArray);
    fill(this.strokeColor);
    stroke(this.strokeColor);
    for (let i = 0; i < this.points.length; i++) {
      ellipse(this.points[i].x, this.points[i].y, 2, 2);
      text(`(${this.points[i].x.toFixed(1)}, ${this.points[i].y.toFixed(1)})`, this.points[i].x - 5, this.points[i].y + 7);
    }
    this.drawDebugCentroidCalculation()
    pop();
  }

  drawDebugCentroidCalculation() {
    push();
    translate(0, 0, this.z + 0.3);
    let centroid = this.getCentroid();
    Polygon.shader.setUniform("uColor", this.intenseColorArray);
    fill(this.intenseColor);
    stroke(this.intenseColor);    
    ellipse(centroid.x, centroid.y, 4, 4);
    text(`(${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)})`, centroid.x - 5, centroid.y + 7);
    pop();
    for (let i = 0; i < this.points.length; i++) {
      this.drawShaderLine(centroid.x, centroid.y, this.points[i].x, this.points[i].y, this.intenseColorArray);
    }
  }

  drawShaderLine(x1, y1, x2, y2, colorStroke) {
    push();
    translate(0, 0, this.z + 0.4);
    Polygon.shader.setUniform('uColor', colorStroke);
    beginShape(LINES);
    vertex(x1, y1, this.z + 0.1);
    vertex(x2, y2, this.z + 0.1);
    endShape();
    pop();
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
    let hue = 0;
    let poly = new Polygon(
      parsePath(svgPath),
      0.1,
      `hsla(${hue}, 50%, 50%, 0.3)`,
      `hsla(${hue}, 50%, 50%, 0.4)`,
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