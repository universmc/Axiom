const express = require('express');
const jsonServer = require('json-server');

const app = express();

app.use(jsonServer.bodyParser());
app.use(jsonServer.params());
app.use(jsonServer.query());

// Importer le fichier db.json
const db = require('./db.json');

// Définition de la fonction de routage pour les données du modèle
function getData(req, res) {
  return res.json(db);
}

// Définition de la fonction de routage pour les modifications des données
function putData(req, res) {
  const { body } = req.params;
  db.body = body;
  return res.status(201).json(body);
}

app.get('/api/models', getData);
app.put('/api/models/:id', putData);

// Définition de la fonction de routage pour les requêtes de recherche
function search(req, res) {
  const query = req.query.q;
  // Recherche des modèles qui contiennent le terme "q"
  const results = db.models.filter(model => model.name.includes(query));
  return res.json(results);
}

app.get('/api/models/search', search);

// Définition de la fonction de routage pour les requêtes de détails
function details(req, res) {
  const { id } = req.params;
  // Récupération du modèle à partir de son ID
  const model = db.models.find(model => model.id === parseInt(id));
  if (!model) {
    return res.status(404).json({ error: 'Modèle non trouvé' });
  }
  return res.json(model);
}

app.get('/api/models/:id', details);

// Définition de la fonction de routage pour les requêtes de suppression
function deleteModel(req, res) {
  const { id } = req.params;
  // Suppression du modèle à partir de son ID
  db.models.splice(db.models.findIndex(model => model.id === parseInt(id)), 1);
  return res.json({ message: 'Modèle supprimé avec succès' });
}

app.delete('/api/models/:id', deleteModel);

// Définition de la fonction de routage pour les requêtes de mises à jour
function update(req, res) {
  const { body } = req.params;
  db.body = body;
  return res.json(body);
}

app.put('/api/models/update', update);

// Exécution du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));