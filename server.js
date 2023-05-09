const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const si = require('systeminformation');
const os = require('os');




app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

async function getTemperatureData() {
  try {
    const graphics = await si.graphics();
    if (graphics.controllers && graphics.controllers.length > 0) {
      const gpuController = graphics.controllers[0];
      if (gpuController.temperatureGpu !== -1) {
        io.emit('gpuTemperature', gpuController.temperatureGpu);
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de température: ${error.message}`);
  }
}



const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});



async function getRamUsageData() {
  try {
    const memData = await si.mem();
    const ramUsagePercentage = (memData.used / memData.total) * 100;
    console.log(`Utilisation de la RAM: ${ramUsagePercentage.toFixed(2)}%`);
    io.emit('ramUsage', ramUsagePercentage.toFixed(2));
  } catch (error) {
    console.error(`Erreur lors de la récupération des données d'utilisation de la RAM: ${error.message}`);
  }
}

async function getConnectionData() {
  try {
    const networkStats = await si.networkStats();
    if (networkStats && networkStats.length > 0) {
      const primaryInterface = networkStats[0];
      io.emit('connectionData', primaryInterface.tx_sec, primaryInterface.rx_sec);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de connexion: ${error.message}`);
  }
}

async function getCpuUsageData() {
  try {
    const cpuData = await si.currentLoad();
    const cpuUsagePercentage = cpuData.currentLoad;
  console.log(`Temperature du CPU: ${cpuUsagePercentage.toFixed(2)}°C`);
    io.emit('cpuUsage', cpuUsagePercentage.toFixed(2)); // Envoyer les données d'utilisation du CPU via Socket.io
  } catch (error) {
    console.error(`Erreur lors de la récupération des données d'utilisation du CPU: ${error.message}`);
  }
}


async function getOsInfo() {

  try {
    const osInfo = await si.osInfo();
    console.log(osInfo);
    io.emit('osInfo', osInfo);
  } catch (error) {
    console.error(`Erreur lors de la récupération des informations du système d'exploitation: ${error.message}`);
  }
}

async function getDiskUsageData() {
  try {
    const diskData = await si.fsSize();
    console.log(diskData);
    io.emit('diskUsage', diskData);
  } catch (error) {
    console.error(`Erreur lors de la récupération des données d'utilisation du disque: ${error.message}`);
  }
}
// Exécutez les fonctions getTemperatureData et getRamUsageData toutes les 5 secondes (5000 millisecondes)
setInterval(() => {
  getTemperatureData();
  getRamUsageData();
  getConnectionData();
  getCpuUsageData();
  getOsInfo();
  getDiskUsageData();


}, 5000);
