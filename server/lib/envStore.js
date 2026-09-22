const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

function readEnvLines() {
  if (fs.existsSync(ENV_PATH)) {
    return fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
  }
  if (fs.existsSync(EXAMPLE_PATH)) {
    return fs.readFileSync(EXAMPLE_PATH, 'utf-8').split('\n');
  }
  return [];
}

function setEnvValue(key, value) {
  const lines = readEnvLines();
  let found = false;

  const newLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    newLines.push(`${key}=${value}`);
  }

  fs.writeFileSync(ENV_PATH, newLines.join('\n'));
}

module.exports = { setEnvValue };
