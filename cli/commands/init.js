const fs = require('fs');
const path = require('path');

const initRepo = (repoId) => {
  const dirPath = path.join(process.cwd(), '.devcollab');
  const configPath = path.join(dirPath, 'config.json');

  if (fs.existsSync(dirPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ repoId }, null, 2));
    console.log(`Re-initialized and linked to new repo ID: ${repoId}`);
    return;
  }
  
  fs.mkdirSync(dirPath);
  fs.writeFileSync(configPath, JSON.stringify({ repoId }, null, 2));
  console.log(`Initialized empty DevCollab repository locally linked to repo ID: ${repoId}`);
};

module.exports = { initRepo };
