const fs = require('fs');
const axios = require('axios');
const Groq = require('groq-sdk');
const { WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh } = require('three');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const workPlan = require('./workplan.json'); // Charger le plan de travail à partir d'un fichier JSON

// Fonction principale pour générer la page web pour chaque phase du projet
async function generateWebPagesForPhases() {
  for (const task of workPlan.tasks) {
    try {
      console.log(`Démarrage de la génération de la page Web pour la phase : ${task.phase}`);
      
      // Générer le contenu en fonction de la phase
      const content = await generateContent(task.phase);

      // Générer la structure HTML/CSS/JS pour chaque phase
      await generateStructure(content, task.phase);

      console.log(`Page Web générée avec succès pour la phase : ${task.phase}`);
    } catch (error) {
      console.error(`Erreur lors de la génération de la page pour la phase ${task.phase} :`, error);
    }
  }
}

// Fonction pour générer le contenu texte
async function generateContent(phase) {
  console.log("Génération du contenu pour la phase :", phase);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: `Génère un contenu détaillé pour une page Web sur la phase : ${phase}` }],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 2048
    });

    const contentText = chatCompletion.choices[0]?.message?.content || 'Contenu indisponible';

    return { text: contentText };
  } catch (error) {
    console.error("Erreur lors de la génération du contenu :", error);
    throw error;
  }
}

// Fonction pour générer la structure HTML/CSS/JS
async function generateStructure(content, phase) {
  try {
    console.log("Génération de la structure HTML/CSS/JS pour la phase :", phase);

    // Générer HTML
    const html = generateHTML(content, phase);
    const htmlFile = `page_${phase}_${new Date().toISOString().replace(/[-:TZ]/g, "")}.html`;
    fs.writeFileSync(htmlFile, html);

    // Générer CSS
    const css = generateCSS();
    const cssFile = `src/css/style_${phase}_${new Date().toISOString().replace(/[-:TZ]/g, "")}.css`;
    fs.writeFileSync(cssFile, css);

    // Générer JS
    const js = generateJavaScript(phase);
    const jsFile = `src/js/canvas_${phase}_${new Date().toISOString().replace(/[-:TZ]/g, "")}.js`;
    fs.writeFileSync(jsFile, js);

    // Générer JSON pour le pipeline de données
    const json = generatePipelineJSON(phase);
    const jsonFile = `src/json/pipeline_${phase}_${new Date().toISOString().replace(/[-:TZ]/g, "")}.json`;
    fs.writeFileSync(jsonFile, json);

    console.log("Structure HTML/CSS/JS générée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la génération de la structure :", error);
    throw error;
  }
}

// Générateur HTML avec intégration d'un canvas 16:9 pour chaque phase
function generateHTML(content, phase) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page sur ${phase}</title>
    <link href="src/css/style_${phase}.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.min.js"></script>
  </head>
  <body>
    <div class="container">
      <h1 class="title">${phase}</h1>
      <div id="sommaire"></div>
      <div class="canvas-container">
        <canvas id="webglCanvas"></canvas>
      </div>
      <div class="content">
        ${content.text}
      </div>

      <div id="content"></div>
    </div>
    <script src="src/js/canvas_${phase}.js"></script>
    <script src="src/js/pipeline_${phase}.js"></script>
  </body>
  </html>
  `;
}

// Générateur CSS pour le canvas et la structure
function generateCSS() {
  return `
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  padding: 20px;
  box-sizing: border-box; /* Assure que les marges et bordures sont incluses dans la taille */
}

.container {
  max-width: 900px; /* Taille maximale du conteneur principal */
  margin: 0 auto;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  box-sizing: border-box; /* Limite les débordements */
}

.title {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 20px;
}

.canvas-container {
  width: 100%; /* 100% de la largeur du conteneur */
  max-width: 800px; /* Limite de largeur maximale pour ne pas dépasser */
  height: 450px; /* Taille fixe pour le canvas, ici on a un ratio 16:9 */
  margin: 0 auto; /* Centrer le canvas */
  position: relative;
  box-sizing: border-box; /* Empêche les débordements */
}

#webglCanvas {
  width: 100%; /* Le canvas occupera toute la largeur du container */
  height: 100%; /* Le canvas occupera toute la hauteur du container */
  display: block;
  box-sizing: border-box; /* Empêche les débordements */
}

.content {
  font-size: 1.2em;
  line-height: 1.6;
  color: #555;
}


  `;
}

// Générateur JavaScript avec utilisation de Three.js pour afficher le canvas
function generateJavaScript(phase) {
  return `
  document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('webglCanvas');
    const scene = new THREE.Scene();
    
    // Récupérer les dimensions du conteneur parent
    const container = document.querySelector('.canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
  
    // Configurer le renderer avec les dimensions du conteneur
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(width, height); // Fixer la taille du renderer
    
    // Ajuster la caméra à la taille du canvas
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
  
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  
    // Écouteur pour ajuster la taille lors d'un redimensionnement manuel de la fenêtre
    window.addEventListener('resize', () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    });
  });
  `;
}


// Générateur JSON pour pipeline
function generatePipelineJSON(phase) {
  const pipeline = [
    {
      titre: "Introduction",
      sousSections: [
        { sousTitre: "Contexte", contenu: `Description du contexte de la phase: ${phase}` },
        { sousTitre: "Objectifs", contenuMarkdown: "src/md/intro.md" }
      ]
    },
    {
      titre: "Développement",
      sousSections: [
        { sousTitre: "Étape 1", contenuMarkdown: "src/md/Project.md" },
        { sousTitre: "Étape 2", contenuMarkdown: "src/md/Objectif.md" },
        { sousTitre: "Étape 3", contenuMarkdown: "src/md/Smart.md" }
      ]
    }
  ];

  return JSON.stringify(pipeline, null, 2);
}

// Exécution de la génération des pages pour chaque phase
generateWebPagesForPhases();
