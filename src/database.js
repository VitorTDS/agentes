const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');
const databasePath = path.join(dataDir, 'database.json');

function ensureDatabase(defaultData) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(databasePath)) {
    saveDatabase(defaultData);
  }
}

function loadDatabase(defaultData) {
  ensureDatabase(defaultData);

  try {
    const content = fs.readFileSync(databasePath, 'utf8');
    const parsed = JSON.parse(content);

    return {
      agents: Array.isArray(parsed.agents) && parsed.agents.length ? parsed.agents : defaultData.agents,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultData.tasks,
      logs: Array.isArray(parsed.logs) ? parsed.logs : defaultData.logs
    };
  } catch (error) {
    const backupPath = `${databasePath}.broken-${Date.now()}`;
    fs.copyFileSync(databasePath, backupPath);
    saveDatabase(defaultData);
    return defaultData;
  }
}

function saveDatabase(data) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(databasePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  databasePath,
  loadDatabase,
  saveDatabase
};
