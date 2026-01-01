const fs = require('fs');
const path = require('path');

const libsDir = path.join(__dirname, '../client/libs');
const nodeModulesDir = path.join(__dirname, '../node_modules');

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(libsDir)) {
  fs.mkdirSync(libsDir, { recursive: true });
}

// Fichiers à copier
const files = [
  {
    from: path.join(nodeModulesDir, 'phaser/dist/phaser.min.js'),
    to: path.join(libsDir, 'phaser.min.js')
  },
  {
    from: path.join(nodeModulesDir, 'socket.io-client/dist/socket.io.min.js'),
    to: path.join(libsDir, 'socket.io.min.js')
  }
];

let hasError = false;

files.forEach(file => {
  try {
    if (fs.existsSync(file.from)) {
      fs.copyFileSync(file.from, file.to);
      console.log(`✓ Copié: ${path.basename(file.from)}`);
    } else {
      console.warn(`⚠ Fichier source manquant: ${file.from}`);
    }
  } catch (err) {
    console.error(`✗ Erreur lors de la copie de ${path.basename(file.from)}:`, err.message);
    hasError = true;
  }
});

if (hasError) {
  console.error('✗ Erreur lors de la copie des librairies');
  process.exit(1);
} else {
  console.log('✓ Toutes les librairies ont été copiées avec succès!');
}
