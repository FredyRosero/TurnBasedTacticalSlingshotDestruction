precision mediump float;
attribute vec3 aPosition;
attribute vec2 aTextCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec4 vColor;
varying vec2 vTextCoord;

void main() {
  vTextCoord = aTextCoord;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
