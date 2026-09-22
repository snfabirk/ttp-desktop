const path = require('path');
const { rcedit } = require('rcedit');

// electron-builder's eigenes Icon-Embedding (signAndEditExecutable) braucht das
// winCodeSign-Paket, dessen Symlinks sich unter Windows ohne Developer-Mode/Admin
// nicht entpacken lassen. rcedit macht dasselbe (nur das Icon setzen, kein
// Signing) direkt und ohne dieses Problem.
module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  await rcedit(exePath, { icon: path.join(__dirname, 'icon.ico') });
};
