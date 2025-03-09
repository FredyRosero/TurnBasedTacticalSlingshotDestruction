// player.controller.js
class PlayerController {
  constructor(player) {
    this.player = player;
  }
  
  // Maneja eventos de pulsación de tecla individuales
  keyPressed(key) {
    if (key === 'ArrowUp') {
      this.player.jump();
    }
    if (this.player.isOnAir(this.terrainBodies)) {
      if (key === 'ArrowLeft') {
        this.player.glide(-1);
      }
      if (key === 'ArrowRight') {
        this.player.glide(1);
      }
    }
    if (key === 'q') {
      this.player.roll(-1);
    }
    if (key === 'e') {
      this.player.roll(1);
    }
  }
  
  handleContinuousInput(p) {
    if (p.keyIsDown(p.LEFT_ARROW)) {
      this.player.walk(-1);
    }
    if (p.keyIsDown(p.RIGHT_ARROW)) {
      this.player.walk(1);
    }
  }
}
