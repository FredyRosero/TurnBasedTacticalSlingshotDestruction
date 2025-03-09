class Player {
  constructor(x, y) {
    this.width = 30;
    this.height = 30;
    this.moveSpeed = 1;
    this.moveForce = 0.01;
    this.jumpForce = 0.5;
    this.rotationSpeed = 0.05;
    this.doubleJump = false;
    this.body = Bodies.circle(x, y, this.height/2, {
      render: { fillStyle: "#FCED08" }
    });
    this.feet = Bodies.rectangle(x, y + this.height/2 - 5, 5, 5, {
      isSensor: true,
      density: 0.8
    });
    this.composite = Matter.Body.create({ 
      parts: [this.body, this.feet],
      restitution: 0.0001,
      friction: 0.1,
      frictionStatic: 0.1,
      density: 0.3,
      slop: 0.1
    });
    Matter.Body.setCentre(this.composite, { x: 0, y: -this.height/4 }, true);
    World.add(world, this.composite);
  }

  walk(dir) {
    if (this.isGrounded()) {
      this.setVelocityX(dir * this.moveSpeed);
      Matter.Body.setAngularVelocity(this.composite, 0, false);
    }
  }

  jump() {
    if (!this.isOnAir()) {
      this.doubleJump = true;
      this.applyForce({ x: 0, y: -this.jumpForce });
    } else if (this.doubleJump) {
      this.doubleJump = false;
      this.applyForce({ x: 0, y: -this.jumpForce/2 });
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
    Matter.Body.setPosition(this.composite, { x, y });
  }

  remove() {
    Matter.World.remove(world, this.composite);
  }

  applyForce(force) {
    Matter.Body.applyForce(this.composite, this.composite.position, force);
  }

  setVelocity(velocity) {
    Matter.Body.setVelocity(this.composite, velocity);
  }

  setVelocityX(velocityX) {
    this.setVelocity({ x: velocityX, y: this.composite.velocity.y });
  }

  setAngularVelocity(velocity) {
    Matter.Body.setAngularVelocity(this.composite, velocity);
  }

  isGrounded() {
    // Para simplificar, consideramos que está grounded si el ángulo del composite es cercano a 0
    const angle = this.composite.angle % TWO_PI;
    return angle < PI/4 && angle > -PI/4;
  }

  isOnAir() {
    let collisions = Matter.Query.collides(this.body, terrain.bodies);
    return collisions.length === 0;
  }

  draw() {
    push();
    translate(this.body.position.x, this.body.position.y);
    // Cambia de color según si está en el suelo o en el aire
    if (this.isGrounded()) fill(155, 0, 0);
    else if (this.isOnAir()) fill(155, 155, 0);
    else fill(0, 0, 155);
    beginShape();
    this.body.vertices.forEach(v => vertex(v.x - this.composite.position.x, v.y - this.composite.position.y));
    endShape(CLOSE);
    fill(0);
    noStroke();
    beginShape();
    this.feet.vertices.forEach(v => vertex(v.x - this.composite.position.x, v.y - this.composite.position.y));
    endShape(CLOSE); 
    stroke(0, 255, 0);
    noFill();
    beginShape();
    this.composite.vertices.forEach(v => vertex(v.x - this.composite.position.x, v.y - this.composite.position.y));
    endShape(CLOSE);
    pop();
  }

  onKeyIsPressed() {
    if (keyIsDown(LEFT_ARROW)) {
      player.walk(-1);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      player.walk(1);
    }
  }

  keyPressed(key) {
    if (key === 'ArrowUp') {
      this.jump();
    }
    if (this.isOnAir()) {
      if (key === 'ArrowLeft') {
        this.glide(-1);
      }
      if (key === 'ArrowRight') {
        this.glide(1);
      }
    }
    if (key === 'q') {
      this.roll(-1);
    }
    if (key === 'e') {
      this.roll(1);
    }
  }
}

export default Player;