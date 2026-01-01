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

files.forEach(file => {
  try {
    fs.copyFileSync(file.from, file.to);
    console.log(`✓ Copié: ${path.basename(file.from)}`);
  } catch (err) {
    console.error(`✗ Erreur lors de la copie de ${path.basename(file.from)}:`, err.message);
    process.exit(1);
  }
});

console.log('✓ Toutes les librairies ont été copiées avec succès!');
