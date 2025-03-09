class UI {
  static font;
  background;
  cellDimension;
  zoom = 1.0;
  minZoom = 0.5;
  maxZoom = 3;
  isPannigCamera = false;
  originX = 0;
  originY = 0;
  relativeMouseX;
  relativeMouseY;
  pRelativeMouseX;
  pRelativeMouseY;
  viewHeight;
  viewWidth;
  data;
  bombStartPos = null;
  bombEndPos = null;
  bomStartTime = null;
  bombVector = null;
  intensity = null;

  constructor(socketId){
    this.socketId = socketId;
    console.log("ui.socketId:",socketId);
    this.cellDimension = 50;
    this.data = {
      polygons: [],
    };
  }

  static preload (){
    this.font = loadFont('fonts/Roboto-VariableFont_wdth,wght.ttf');
  }

  setup() {
    this.graphicsLayer = createGraphics(width, height);
    this.background = this.createBackground();
    textFont(UI.font);
  }

  draw() {        
    this.zoomCamera();
    this.panCamera();
    push();
    translate(0, 0, -1); // The image is drawn in WEBGL with an implicit z of 0 and may appear "on top" of subsequently drawn lines if its coordinates are not adjusted.
    imageMode(CENTER);
    image(this.background, 0, 0);
    pop();
    resetShader();
    this.drawViewFrame();
    this.drawBombVector();
    this.drawCursor()        
    this.drawPolygons();
    this.drawPlayerIndicator();
    this.data.players?.forEach(playerEntity => this.drawPlayerHealth(playerEntity));

    this.pRelativeMouseX = this.relativeMouseX;
    this.pRelativeMouseY = this.relativeMouseY;
  }


  drawPlayerIndicator(){
    let playerEntity = this.getPlayer();
    if(!playerEntity) return;
    console.log("playerEntity:",playerEntity)
    push();
    translate(playerEntity.x, playerEntity.y, 0);
    fill(255, 0, 0,50);
    ellipse(0, 0, 20, 20);    
    pop();
  }

  drawPlayerHealth(playerEntity){
    push();
    translate(playerEntity.x, playerEntity.y, 0);
    //barra de salud
    let barWidth = 50;
    let barHeight = 10;
    let barX = -barWidth / 2;
    let barY = -40;
    let barFill = color(0, 255, 0);
    let barEmpty = color(255, 0, 0);
    let barValue = map(playerEntity.health, 0, 100, 0, barWidth);
    fill(barEmpty);
    rect(barX, barY, barWidth, barHeight);
    fill(barFill);
    rect(barX, barY, barValue, barHeight);    
    pop();
  }  

  getPlayer() {
    if(!this.data.players) return;
    return this.data.players.find(player => player.socketId === this.socketId);
  }

  setData(data) {
    this.setPolygons(data.polygons);
    this.setPlayers(data.players);
  }

  getData(){
    return this.data;
  }

  setPlayers(playersBackend) {
    if(!playersBackend) return;
    this.data.players = playersBackend.map(playerBackend => {
      let player = new PlayerEntity(playerBackend);
      return player;
    });
  }


  /**
   * Conviert polygonsBackend en un arreglo de objetos Polygon y los guarda en el atributo data.polygons
   */
  setPolygons(polygonsBackend) {
    if(!polygonsBackend) return;
    this.data.polygons = polygonsBackend.map(polygonBackend => {
      let vertices = polygonBackend.points.map(vertex => createVector(vertex.x, vertex.y));
      let polygon = new Polygon(vertices,polygonBackend.z);      
      return polygon;
    });
  }

  getPolygons() {
    return this.data.polygons;
  }

  drawPolygons() {
    this.data.polygons.forEach(polygon => {
      polygon.draw();
    });
  }

  drawCursor() {
    let x = this.getRelativeMouseX();
    let y = this.getRelativeMouseY();
    push();
    noFill();
    stroke(255, 0, 0);
    translate(0,0,1)
    ellipse(x, y, 10, 10);
    fill(0);
    noStroke();
    textSize(8);
    textAlign(CENTER);
    text(`(${x.toFixed(1)}, ${y.toFixed(1)})`, x, y + 20);
    pop();
  }

  drawViewFrame(){
    this.viewHeight = height / this.zoom;
    this.viewWidth = width / this.zoom;
    push();
    rectMode(CENTER);
    noFill();
    stroke(255, 0, 0);
    strokeWeight(5);
    rect(-this.originX, -this.originY, this.viewWidth, this.viewHeight);    
    pop();
  }

  drawBombVector() {
    if (this.bombStartPos !== null) {
      this.bombEndPos = createVector(ui.getRelativeMouseX(), ui.getRelativeMouseY());
      this.bombVector = createVector(this.bombEndPos.x - this.bombStartPos.x, this.bombEndPos.y - this.bombStartPos.y);
      this.bombVector.normalize();
      this.intensity = (millis() - this.bomStartTime) / 25000;
      let uiVector = createVector(this.bombVector.x, this.bombVector.y).mult(map(this.intensity, 0, 1, 0, 1200));
      push();
      stroke(255, 0, 0);
      strokeWeight(2);
      beginShape(LINES);
      vertex(this.bombStartPos.x, this.bombStartPos.y);
      vertex(this.bombStartPos.x + uiVector.x, this.bombStartPos.y + uiVector.y);
      endShape();
      pop();       
    }
  }

  getRelativeMouseX() {
    return (mouseX - width/2) / this.zoom - this.originX;
  }
  
  getRelativeMouseY() {
    return (mouseY - height/2) / this.zoom - this.originY;
  }

  getPRelativeMouseX() {
    return (pmouseX - width/2) / this.zoom - this.originX;
  }
  
  getPRelativeMouseY() {
    return (pmouseY - height/2) / this.zoom - this.originY;
  }

  zoomCamera() {
    scale(this.zoom);
  }

  panCamera() {
    translate(this.originX, this.originY);
  }

  createBackground() {
    let gridBuffer = createGraphics(width, height);
    gridBuffer.clear();
    gridBuffer.push();
    gridBuffer.background(255);
    gridBuffer.translate(width / 2, height / 2);    
    let fontSizeBig = 10;
    let fontSizeSmall = 5;
    let colorBig = color('rgba(0%, 0%, 0%, 0.1)');
    let colorSmall = color('rgba(0%, 0%, 0%, 0.2)');
    gridBuffer.textAlign(CENTER); 
    gridBuffer.drawingContext.setLineDash([1, 2]);

    for (let x = -(width/this.cellDimension).toFixed(0)*this.cellDimension; x <= width; x += this.cellDimension) {
      gridBuffer.strokeWeight(1);
      if (x % 100 === 0) {
        gridBuffer.textSize(fontSizeBig);
        gridBuffer.stroke(colorBig);
        gridBuffer.fill(colorBig);
      } else {
        gridBuffer.textSize(fontSizeSmall);
        gridBuffer.stroke(colorSmall);
        gridBuffer.fill(colorSmall);
      }
      gridBuffer.line(x, -height, x, height);
      gridBuffer.stroke('white');
      gridBuffer.text(x, x, 0-2);
    }

    for (let y = -(height/this.cellDimension).toFixed(0)*this.cellDimension; y <= height; y += this.cellDimension) {
      gridBuffer.strokeWeight(1);
      if (y % 100 === 0) {
        gridBuffer.textSize(fontSizeBig);
        gridBuffer.stroke(colorBig);
        gridBuffer.fill(colorBig);
      } else {
        gridBuffer.textSize(fontSizeSmall);
        gridBuffer.stroke(colorSmall);
        gridBuffer.fill(colorSmall);
      }
      gridBuffer.line(-width, y, width, y);
      gridBuffer.stroke('white');
      gridBuffer.text(y, 0, y-2);
    }

    gridBuffer.stroke(255, 0, 0, 150);
    gridBuffer.strokeWeight(1);
    gridBuffer.line(-width, 0, width, 0);
    gridBuffer.stroke(0, 0, 255, 150);
    gridBuffer.strokeWeight(1);
    gridBuffer.line(0, -height, 0, height);
    gridBuffer.pop();

    return gridBuffer.get();
  }

  keyPressed(key) {    
    if (key === ' ') {
      let playerEntity = this.getPlayer();
      if (playerEntity) {
        let x = playerEntity.x;
        let y = playerEntity.y;
        this.bombStartPos = createVector(x, y);
        this.bomStartTime = millis();
      }
    }

    if (key === 'r') {
      socket.emit('resetGame');
    }

    if (key === 'Enter') {
      socket.emit('addPlayer', {
        x: ui.getRelativeMouseX(),
        y: ui.getRelativeMouseY()
      });
    }
  }

  keyReleased() {
    if (key === ' ' && this.bombStartPos !== null) {
      //logic.launchBomb(this.bombStartPos.x, this.bombStartPos.y, this., this.intensity);
      sendLaunchBomb({
        x: this.bombStartPos.x,
        y: this.bombStartPos.y,
        vector: this.bombVector,
        intensity: this.intensity
      });
      this.bombStartPos = null;
    }
  }

  mousePressed() {

  }

  mouseReleased() {

  }

  mouseDragged() {
    let dx = this.getRelativeMouseX() - this.getPRelativeMouseX();
    let dy = this.getRelativeMouseY() - this.getPRelativeMouseY();
    this.originX += dx;
    this.originY += dy;
  }

  mouseWheel(event) {
    let pivotX = this.getRelativeMouseX();
    let pivotY = this.getRelativeMouseY();
    let newZoom = constrain(this.zoom - event.delta * 0.001, this.minZoom, this.maxZoom);    
    this.originX = (mouseX - width / 2) / newZoom - pivotX;
    this.originY = (mouseY - height / 2) / newZoom - pivotY;    
    this.zoom = newZoom;
    return false;
  }
}
