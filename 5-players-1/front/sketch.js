let ui;
let gl;

let simulationData = []; // Aquí se almacenará el estado recibido del servidor
let socketConnected = false;

socket.on('simulationUpdate', (data) => {
  simulationData = data;
});

function sendAddPolygon(data) {
  socket.emit('addPolygon', data);
}

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
  UI.preload();
  Polygon.preload();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noLoop(); 
  frameRate(15);
  Polygon.setup();
  gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST); 
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);  
  socket.on('connect', () => {
    socketConnected = true;
    console.log('Socket conectado:', socket.id);
    ui = new UI(socket.id);
    ui.setup();
    loop(); 
  });  
}

function draw() {  
  if (!socketConnected) return;
  ui.setData(simulationData);
  drawBase();    
  drawDebug();  
  ui.draw();
}

function drawDebug() {
}

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

  ui.keyPressed(key);
}

function keyReleased() {
  ui.keyReleased(key);
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
  socket.emit('doExplosion', {
    x: x,
    y: y,
    radius: 100
  });
}

function mouseReleased() {
  ui.mouseReleased();
}

