// player.view.js
class PlayerView {
  constructor(player) {
    this.player = player;
  }
  
  draw(p) {
    p.push();
    // Traslada al centro del composite
    p.translate(this.player.composite.position.x, this.player.composite.position.y);
    // Dibuja el cuerpo del jugador
    p.fill(155, 0, 0);
    p.noStroke();
    p.beginShape();
    for (let v of this.player.body.vertices) {
      p.vertex(v.x - this.player.composite.position.x, v.y - this.player.composite.position.y);
    }
    p.endShape(p.CLOSE);
    // Dibuja el sensor de "pies"
    p.fill(0);
    p.beginShape();
    for (let v of this.player.feet.vertices) {
      p.vertex(v.x - this.player.composite.position.x, v.y - this.player.composite.position.y);
    }
    p.endShape(p.CLOSE);
    p.pop();
  }
}