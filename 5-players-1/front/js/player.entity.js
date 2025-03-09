class PlayerEntity {
    constructor(playerBackend) {
      this.x = playerBackend.x;
      this.y = playerBackend.y;
      this.socketId = playerBackend.socketId;
      this.health = playerBackend.health;
    }
}