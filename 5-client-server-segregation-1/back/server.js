import express from 'express';
import http from 'http';
import https from 'https'; 
import { Server } from 'socket.io';
import fs from 'fs';
import Logic from './logic.class.js';

const app = express();

const ssl_path = process.env.SSL_PATH??'/etc/ssl';
console.log('ssl_path:', ssl_path);
const options = {
  key: fs.readFileSync(`${ssl_path}/private/selfsigned.key`),
  cert: fs.readFileSync(`${ssl_path}/certs/selfsigned.crt`)
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

const io = new Server({
  cors: { origin: '*' }
});

io.attach(httpServer);
io.attach(httpsServer);

let logic = new Logic();

logic.engine.enableSleeping = true;
logic.engine.positionIterations = 5;
logic.engine.velocityIterations = 3;
logic.engine.constraintIterations = 2;

// Función de loop de simulación (15 ticks por segundo)
function simulationLoop() {
  logic.update();
  // Extrae la información relevante de los cuerpos para enviar al cliente.
  let data = {
    polygons: logic.getPolygonsFromBodies()
  }
  // Envía el estado de la simulación a todos los clientes conectados
  io.emit('simulationUpdate', data);
}

// Ejecuta la simulación a 15 ticks por segundo
setInterval(simulationLoop, 1000 / 15);

// Configuración de Socket.io para recibir comandos del cliente
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Por ejemplo, para agregar un polígono
  socket.on('addPolygon', (data) => {
    console.log('Nuevo polígono:', data);
    logic.addBodyFromPolygon(data.polygon);
  });
  
  // Para lanzar una bomba, por ejemplo
  socket.on('launchBomb', (data) => {
    console.log('Lanzar bomba:', data);
    logic.launchBomb(data.x, data.y, data.vector, data.intensity);
  });

  socket.on('doExplosion', (data) => {
    console.log('doExplosion event received:', data);
    logic.doExplosion(data.x, data.y, data.radius);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`Servidor HTTP corriendo en el puerto ${HTTP_PORT}`);
});

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`Servidor HTTPS seguro corriendo en el puerto ${HTTPS_PORT}`);
});