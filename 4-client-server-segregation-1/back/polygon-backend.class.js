import { JSDOM } from 'jsdom';
import svgPathParser from 'svg-path-parser';
const { parseSVG } = svgPathParser;
import ClipperLib from 'clipper-lib';
import earcut from 'earcut';
const TWO_PI = 2 * Math.PI;
const cos = Math.cos;
const sin = Math.sin;

class PolygonBackend {

  static shader = null;
  static strokeShader = null;

  static triangulatePolygons(polygons) {
    let newPolygons = [];
    for (let polygon of polygons) {
      let coords = [];
      polygon.points.forEach(p => {
        coords.push(p.x, p.y);
      });
      let indexTriangledPoints = earcut(coords);
      for (let i = 0; i < indexTriangledPoints.length; i += 3) {
        let idx0 = indexTriangledPoints[i];
        let idx1 = indexTriangledPoints[i + 1];
        let idx2 = indexTriangledPoints[i + 2];
        let newPolygon = new PolygonBackend(
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
    let simplified = result.map(path => PolygonBackend.simplifyPath(path, epsilon));
    return simplified;
  }

  static simplifyPath(points, epsilon) {
    if (points.length < 3) return points;
    
    // Encuentra el punto con la mayor distancia
    let dmax = 0;
    let index = 0;
    let end = points.length - 1;
    
    for (let i = 1; i < end; i++) {
      let d = PolygonBackend.perpendicularDistance(points[i], points[0], points[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
    
    // Si el máximo es mayor que epsilon, se simplifica recursivamente
    if (dmax > epsilon) {
      let recResults1 = PolygonBackend.simplifyPath(points.slice(0, index + 1), epsilon);
      let recResults2 = PolygonBackend.simplifyPath(points.slice(index), epsilon);
      
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
      return PolygonBackend.calculateDistance(point, lineStart);
    }
    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    let nearestX = lineStart.x + t * dx;
    let nearestY = lineStart.y + t * dy;
    return PolygonBackend.calculateDistance(point, createVector(nearestX, nearestY));
  }
  
  static calculateDistance(pt1, pt2) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
  }


  points = [];

  /**
   * Creates a new PolygonBackend instance.
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
}

function createVector(x, y) {
  return { x, y };
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
  let dom = new JSDOM(svg.join('\n'), { contentType: "image/svg+xml" });
  let svgDoc = dom.window.document;
  let svgPaths = svgDoc.getElementsByTagName("path");
  if (svgPaths.length === 0) {
    console.error("No se encontraron elementos <path> en el SVG");
    return;
  }
  let polys = [];
  for (let i = 0; i < svgPaths.length; i++) {
    let svgPath = svgPaths[i];
    let poly = new PolygonBackend(parsePath(svgPath), 0.1);
    polys.push(poly);
  }
  return polys;
}

/**
 * Parses an SVG path and converts it into an array of vectors.
 * 
 * @param {SVGPathElement} path - The SVG path element to parse.
 * @returns {Array<{x: number, y: number}>} An array of vectors representing the path.
 */
function parsePath(path) {
  const d = path.getAttribute("d");
  // Parsea el string "d" en un arreglo de comandos usando svg-path-parser
  let pathData = parseSVG(d);
  let out = [];
  for (let cmd of pathData) {
    // Usa cmd.code en lugar de cmd.type
    if ("MLHVmlhv".indexOf(cmd.code) !== -1) {
      let x, y;
      if (cmd.code === "M" || cmd.code === "L") {
        x = cmd.x;
        y = cmd.y;
      } else if (cmd.code === "m" || cmd.code === "l") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x + cmd.x;
        y = last.y + cmd.y;
      } else if (cmd.code === "H") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = cmd.x;
        y = last.y;
      } else if (cmd.code === "h") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x + cmd.x;
        y = last.y;
      } else if (cmd.code === "V") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x;
        y = cmd.y;
      } else if (cmd.code === "v") {
        let last = out.length > 0 ? out[out.length - 1] : createVector(0, 0);
        x = last.x;
        y = last.y + cmd.y;
      }
      out.push(createVector(x, y));
    }
  }
  return out;
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function getPathData(path) {

}

export { PolygonBackend, extractPolygonsFromSVG, createVector, parsePath };