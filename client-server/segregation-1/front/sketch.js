let ui;
let gl;

let simulationData = []; // Aquí se almacenará el estado recibido del servidor

socket.on('simulationUpdate', (data) => {
  simulationData = data;
});

// Si necesitas enviar comandos al servidor:
function sendAddPolygon(data) {
  socket.emit('addPolygon', data);
}

function sendLaunchBomb(data) {
  socket.emit('launchBomb', data);
}

function sendDoExplosion(data) {
  socket.emit('doExplosion', data);
}


function preload(){  
  ui = new UI();
  ui.preload();
  Polygon.preload();
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(15);
  Polygon.setup();
  gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST); 
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  ui.setup();
}

function draw() {  
  if (simulationData && simulationData.length > 0) ui.setData(simulationData);
  drawBase();    
  drawDebug();  
  ui.draw();
  drawBombVector();
}

function drawDebug() {
}

function drawBombVector() {
  if (bombStartPos !== null) {
    bombEndPos = createVector(ui.getRelativeMouseX(), ui.getRelativeMouseY());
    vector = createVector(bombEndPos.x - bombStartPos.x, bombEndPos.y - bombStartPos.y);
    // normalizamos el vector para que la fuerza sea constante.
    vector.normalize();
    intensity = (millis() - bomStartTime) / 150000;
    let forceVector = createVector(vector.x, vector.y).mult(map(intensity, 0, 1, 0, 5000));
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    beginShape(LINES);
    vertex(bombStartPos.x, bombStartPos.y);
    vertex(bombStartPos.x + forceVector.x, bombStartPos.y + forceVector.y);
    endShape();
    pop();       
  }
}

// Variable global para guardar la posición inicial de la bomba.
let bombStartPos = null;
let bombEndPos = null;
let bomStartTime = null;
let vector = null;
let intensity = null;

function keyPressed() {
  // Crear un polígono con la tecla "1"
  if (key === '1') {
    let x = ui.getRelativeMouseX();
    let y = ui.getRelativeMouseY();
    let box = new Polygon(
      [
        createVector(x - 20, y - 20),
        createVector(x + 20, y - 20),
        createVector(x + 20, y + 20),
        createVector(x - 20, y + 20)
      ],
      0.5,
      'rgba(162, 0, 255, 0.15)',
      'rgba(255, 0, 200, 0.5)',
      false,
      false
    );
    //logic.addBodyFromPolygon(box);
    sendAddPolygon({
      polygon: box
    }) 
  }

  if (key === ' ') {
    let x = ui.getRelativeMouseX();
    let y = ui.getRelativeMouseY();
    bombStartPos = createVector(x, y);
    bomStartTime = millis();
  }
}

function keyReleased() {
  if (key === ' ' && bombStartPos !== null) {
    //logic.launchBomb(bombStartPos.x, bombStartPos.y, vector, intensity);
    sendLaunchBomb({
      x: bombStartPos.x,
      y: bombStartPos.y,
      vector: vector,
      intensity: intensity
    });
    bombStartPos = null;
  }
}


function mouseDragged() {
  ui.mouseDragged()
}

function mouseWheel(event) {
  ui.mouseWheel(event);
}

function mousePressed() {
  ui.mousePressed();
  let x = ui.getRelativeMouseX();
  let y = ui.getRelativeMouseY();
  //logic.doExplosion(x, y, 100);}
  sendDoExplosion({
    x: x,
    y: y,
    radius: 100
  });
}

function mouseReleased() {
  ui.mouseReleased();
}

