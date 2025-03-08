precision mediump float;
uniform vec4 uColor;
uniform float uOffset;
varying vec2 vTextCoord;

vec3 rgb2hsb(vec3 c) {
  float cMax = max(max(c.r, c.g), c.b);
  float cMin = min(min(c.r, c.g), c.b);
  float delta = cMax - cMin;
  float h = 0.0;
  float s = (cMax == 0.0) ? 0.0 : delta / cMax;
  float b = cMax;
  if (delta != 0.0) {
    if (c.r == cMax) {
      h = (c.g - c.b) / delta;
    } else if (c.g == cMax) {
      h = 2.0 + (c.b - c.r) / delta;
    } else {
      h = 4.0 + (c.r - c.g) / delta;
    }
  }
  h = mod(h / 6.0, 1.0);
  if (h < 0.0) h += 1.0;
  return vec3(h, s, b);
}

vec3 hsb2rgb(vec3 c) {
  float h = c.x * 6.0;
  float s = c.y;
  float b = c.z;
  int i = int(floor(h));
  float f = h - float(i);
  float p = b * (1.0 - s);
  float q = b * (1.0 - s * f);
  float t = b * (1.0 - s * (1.0 - f));
  vec3 rgb;
  if (i == 0) {
    rgb = vec3(b, t, p);
  } else if (i == 1) {
    rgb = vec3(q, b, p);
  } else if (i == 2) {
    rgb = vec3(p, b, t);
  } else if (i == 3) {
    rgb = vec3(p, q, b);
  } else if (i == 4) {
    rgb = vec3(t, p, b);
  } else {
    rgb = vec3(b, p, q);
  }
  return rgb;
}

void main() {
  float hO = rgb2hsb(uColor.rgb).x;
  float h = hO + 0.111*sin(uOffset + vTextCoord.x);
  float s = 0.75;
  float b = 1.0;
  vec3 hsb = vec3(h, s, b);
  vec3 rgb = hsb2rgb(hsb);
  gl_FragColor = vec4(rgb, uColor.a);
}

