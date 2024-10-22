const express = require('express');
const jsonServer = require('json-server');

const app = express();

const db = require('./db.json');

app.use(jsonServer.bodyParser());
app.use(jsonServer.params());
app.use(jsonServer.query());

app.get('/api/data', (req, res) => {
  return res.json(db);
});

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});