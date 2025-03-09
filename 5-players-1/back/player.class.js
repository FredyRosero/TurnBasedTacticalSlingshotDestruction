import Matter from 'matter-js';
const { Bodies, Body, World, Query } = Matter;
const TWO_PI = 2 * Math.PI;
const PI = Math.PI;

class Player {
  constructor(x, y, socketId) {
    this.socketId = socketId;
    this.health = 100;
    this.width = 20;
    this.height = 20;
    this.moveSpeed = 1;
    this.moveForce = 0.01;
    this.jumpForce = 0.5;
    this.rotationSpeed = 0.05;
    this.doubleJump = false;
    // Cuerpo principal (círculo)
    this.body = Bodies.circle(x, y, this.height / 2, {
      label: 'player-body',
      render: { fillStyle: "#FCED08" }
    });
    // Sensor para detectar "pies"
    this.feet = Bodies.rectangle(x, y + this.height / 2 - 5, 5, 5, {
      label: 'player-feet',
      isSensor: true,
      density: 0.8
    });
    // Composite del jugador (agrupa cuerpo y sensor)
    this.composite = Body.create({
      parts: [this.body, this.feet],
      restitution: 0.0001,
      friction: 0.1,
      frictionStatic: 0.1,
      density: 0.3,
      slop: 0.1
    });
    this.composite.isPlayer = true;
    this.composite.socketId = socketId;
    // Ajustar el centro de masa
    Body.setCentre(this.composite, { x: 0, y: -this.height / 4 }, true);
  }

  walk(dir) {
    if (this.isGrounded()) {
      this.setVelocityX(dir * this.moveSpeed);
      Body.setAngularVelocity(this.composite, 0);
    }
  }

  jump() {
    if (!this.isOnAir()) {
      this.doubleJump = true;
      this.applyForce({ x: 0, y: -this.jumpForce });
    } else if (this.doubleJump) {
      this.doubleJump = false;
      this.applyForce({ x: 0, y: -this.jumpForce / 2 });
    }
  }

  glide(dir) {
    if (this.isOnAir()) {
      this.applyForce({ x: dir * this.moveForce, y: 0 });
    }
  }

  roll(dir) {
    this.setAngularVelocity(dir * this.rotationSpeed);
  }

  setPosition(x, y) {
    Body.setPosition(this.composite, { x, y });
  }

  addToWorld(world) {
    World.add(world, this.composite);
  }

  removeFromWorld(world) {
    World.remove(world, this.composite);
  }

  applyForce(force) {
    Body.applyForce(this.composite, this.composite.position, force);
  }

  setVelocity(velocity) {
    Body.setVelocity(this.composite, velocity);
  }

  setVelocityX(velocityX) {
    this.setVelocity({ x: velocityX, y: this.composite.velocity.y });
  }

  setAngularVelocity(velocity) {
    Body.setAngularVelocity(this.composite, velocity);
  }

  // Se considera "grounded" si el ángulo del composite es cercano a 0.
  isGrounded() {
    const angle = this.composite.angle % TWO_PI;
    return angle < PI / 4 && angle > -PI / 4;
  }

  // En este ejemplo, la verificación de "en el aire" se realiza usando colisiones
  isOnAir(terrainBodies = []) {
    let collisions = Query.collides(this.body, terrainBodies);
    return collisions.length === 0;
  }
}

export default Player;
