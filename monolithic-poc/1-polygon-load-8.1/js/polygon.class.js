class Polygon {

  static shader = null;
  static strokeShader = null;

  static preload() {
    Polygon.shader = loadShader('glsl/polygonVertexShader.vert', 'glsl/polygonFragmentShader.frag');
  }

  static setup() {
    Polygon.strokeShader = baseStrokeShader().modify(polygonStrokeShader);
  }

  static triangulatePolygons(polygons) {
    let newPolygons = [];
    for (let polygon of polygons) {
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
          0.5
        );
        newPolygons.push(newPolygon);
      }
    }
    return newPolygons;
  }

  static createCirclePath(cx, cy, r, numSegments = 10) {
    let path = [];
    for (let i = 0; i < numSegments; i++) {
      let angle = map(i, 0, numSegments, 0, TWO_PI);
      path.push(createVector(cx + r * cos(angle), cy + r * sin(angle)));
    }
    return path;
  }

  static subtractPath(subjectPoints, clipPoints) {
    let scale = 100; 
    let subj = [subjectPoints.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
    let clip = [clipPoints.map(v => ({ X: Math.round(v.x * scale), Y: Math.round(v.y * scale) }))];
    
    let cpr = new ClipperLib.Clipper();
    cpr.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);
    cpr.AddPaths(clip, ClipperLib.PolyType.ptClip, true);
    
    let solution = new ClipperLib.Paths();
    cpr.Execute(ClipperLib.ClipType.ctDifference, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

    let result = solution.map(path => path.map(pt => createVector(pt.X / scale, pt.Y / scale)));
    //return result;
    const epsilon = 2; 
    let simplified = result.map(path => Polygon.simplifyPath(path, epsilon));
    return simplified;
  }

  static simplifyPath(points, epsilon) {
    if (points.length < 3) return points;
    
    // Encuentra el punto con la mayor distancia
    let dmax = 0;
    let index = 0;
    let end = points.length - 1;
    
    for (let i = 1; i < end; i++) {
      let d = Polygon.perpendicularDistance(points[i], points[0], points[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
    
    // Si el máximo es mayor que epsilon, se simplifica recursivamente
    if (dmax > epsilon) {
      let recResults1 = Polygon.simplifyPath(points.slice(0, index + 1), epsilon);
      let recResults2 = Polygon.simplifyPath(points.slice(index), epsilon);
      
      // Combina resultados, evitando duplicar el punto del medio
      return recResults1.slice(0, -1).concat(recResults2);
    } else {
      // Si no es mayor, se mantiene la línea formada por el primer y último punto
      return [points[0], points[end]];
    }
  }
  
  static perpendicularDistance(point, lineStart, lineEnd) {
    let dx = lineEnd.x - lineStart.x;
    let dy = lineEnd.y - lineStart.y;
    if (dx === 0 && dy === 0) {
      return Polygon.calculateDistance(point, lineStart);
    }
    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    let nearestX = lineStart.x + t * dx;
    let nearestY = lineStart.y + t * dy;
    return Polygon.calculateDistance(point, createVector(nearestX, nearestY));
  }
  
  static calculateDistance(pt1, pt2) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
  }


  points = [];

  /**
   * Creates a new Polygon instance.
   *
   * @param {Array} points - An array of points defining the polygon's vertices.
   * @param {float} z - The z value of the polygon.
   */
  constructor(points, z) {
    this.points = points;
    this.z = z;
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
    //blendMode(MULTIPLY);
    push();
    shader(Polygon.shader);
    Polygon.shader.setUniform("uColor", [1, 0, 0, 0.5]);
    beginShape(TRIANGLE_FAN);
    for (let i = 0; i < this.points.length; i ++) {
      vertex(this.points[i].x, this.points[i].y, this.z);
      vertex(this.points[(i + 1) % this.points.length].x, this.points[(i + 1) % this.points.length].y, this.z);
    }
    endShape(CLOSE); 
    pop();
     
    push();
    stroke(255,0,0,255);
    fill(255,0,0,127);
    shader(Polygon.strokeShader);
    strokeWeight(2);
    beginShape(LINES);
    for (let i = 0; i < this.points.length; i ++) {
      vertex(this.points[i].x, this.points[i].y, this.z);
      vertex(this.points[(i + 1) % this.points.length].x, this.points[(i + 1) % this.points.length].y, this.z);
    }
    endShape();
    pop(); 
  }

  /**
   * Returns a string representation of the polygon.
   * 
   * @returns {string} A string containing the polygon's details.
   */
  toString() {
    const centroid = this.getCentroid();
    return `Polygon: ${this.points.length} points, centroid: (${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)}), isStatic: ${this.isStatic}`;
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
    let poly = new Polygon(
      parsePath(svgPath),
      0.1
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
  for (let cmd of pathData) {
    if ("MLHVmlhv".indexOf(cmd.type) !== -1) {
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