const os = require('os');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(os.homedir(), '.devcollab.json');

const getConfig = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  }
  return {};
};

const saveConfig = (config) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
};

module.exports = {
  getConfig,
  saveConfig
};
