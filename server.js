const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const si = require('systeminformation');


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



async function getCpuTemperature() {
  try {
    const cpuTemperature = await si.cpuTemperature();
    if (cpuTemperature && cpuTemperature.main && cpuTemperature.main > 0) {
      io.emit('cpuTemperature', cpuTemperature.main);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de température du CPU: ${error.message}`);
  }
}



// Exécutez les fonctions getTemperatureData et getRamUsageData toutes les 5 secondes (5000 millisecondes)
setInterval(() => {
  getTemperatureData();
  getRamUsageData();
  getConnectionData(); 
  getCpuTemperature();
  
}, 5000);
