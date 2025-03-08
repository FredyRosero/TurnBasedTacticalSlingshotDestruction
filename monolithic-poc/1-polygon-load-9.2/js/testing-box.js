function keyPressed() {
    if (key === ' ') {
      let box = Bodies.rectangle(mouseX, mouseY, 40, 40, {
        restitution: 0.5,
        density: 0.001
      });
      World.add(world, box);
      boxes.push(box);
    }
  }