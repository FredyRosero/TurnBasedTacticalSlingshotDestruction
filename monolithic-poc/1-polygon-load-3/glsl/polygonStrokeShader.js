/**
 * see https://p5js.org/reference/p5/baseStrokeShader/
 */
const polygonStrokeShader =
{
  uniforms: {
    'float time': () => millis()
  },
  declarations: 
  'vec3 myPosition;',
  'vec3 getLocalPosition': `(vec3 pos) {
    myPosition = pos;
    return pos;
  }`,
  'float getStrokeWeight': `(float w) {
    float scale = 0.7 + 0.3*sin(10.0 * sin(
      floor(time/250.) +
      myPosition.x*0.01 +
      myPosition.y*0.01
    ));
    return w * scale;
  }`,
  'vec4 getVertexColor': `(vec4 color) {    
    return color;
  }`
}