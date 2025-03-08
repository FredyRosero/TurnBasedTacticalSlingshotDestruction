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
   * @param {(string|number)} fill - The fill color value, interpreted by the color() function.
   * @param {(string|number)} stroke - The stroke color value, interpreted by the color() function.
   * @param {boolean} [debug=false] - Optional flag to enable debugging mode.
   */
  constructor(points, fill, stroke, debug = false) {
    //console.log("Polygon.constructor():\n", points, fill, stroke, debug);
    this.debug = debug;
    this.fillColor = color(fill);
    this.strokeColor = color(stroke);
    this.intenseColor = color(this.strokeColor.toString());
    colorMode(HSB, 255);
    this.intenseColor = color(hue(this.intenseColor), 255, 255, 245);
    colorMode(RGB, 255);
    this.points = points;
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

  draw() {
    shader(Polygon.strokeShader);
    stroke(this.strokeColor);  
    shader(Polygon.shader);
    Polygon.shader.setUniform("uOffset", millis() / 1000);

    let coords = [];
    this.points.forEach(p => {
      coords.push(p.x, p.y);
    });
    let triangledPoints = earcut.default(coords);

    push();
      Polygon.shader.setUniform("uColor", [
        red(this.strokeColor) / 255,
        green(this.strokeColor) / 255,
        blue(this.strokeColor) / 255,
        alpha(this.strokeColor) / 255
      ]);
      beginShape(LINES);
      for (let i = 0; i < triangledPoints.length; i += 3) {
        let idx0 = triangledPoints[i];
        let idx1 = triangledPoints[i + 1];
        let idx2 = triangledPoints[i + 2];

        vertex(this.points[idx0].x, this.points[idx0].y);
        vertex(this.points[idx1].x, this.points[idx1].y);
  
        vertex(this.points[idx1].x, this.points[idx1].y);
        vertex(this.points[idx2].x, this.points[idx2].y);
  
        vertex(this.points[idx2].x, this.points[idx2].y);
        vertex(this.points[idx0].x, this.points[idx0].y);
      }
      endShape();
    pop(); 

    push();    
    translate(0, 0, 0.1);
    strokeWeight(3);
    Polygon.shader.setUniform("uColor", [
      red(this.fillColor) / 255,
      green(this.fillColor) / 255,
      blue(this.fillColor) / 255,
      alpha(this.fillColor) / 255
    ]);
    beginShape(TRIANGLES);
    for (let i = 0; i < triangledPoints.length; i++) {
      let idx = triangledPoints[i];
      vertex(this.points[idx].x, this.points[idx].y);
    }
    endShape();
    pop();     

    if (this.debug) this.drawDebug();
  }

  drawDebug() {
    push();
    textSize(4);
    fill(this.intenseColor);
    noStroke();
    for (let i = 0; i < this.points.length; i++) {
      ellipse(this.points[i].x, this.points[i].y, 2, 2);
      text(`(${this.points[i].x.toFixed(1)}, ${this.points[i].y.toFixed(1)})`, this.points[i].x - 5, this.points[i].y + 7);
    }
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
    let hue = random(360).toFixed(0);
    let poly = new Polygon(
      parsePath(svgPath),
      `hsla(${hue}, 50%, 50%, 0.5)`,
      `hsla(${hue}, 50%, 10%, 0.5)`,
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