const fs = require('fs');
const path = require('path');

const initRepo = (repoId) => {
  const dirPath = path.join(process.cwd(), '.devcollab');
  if (fs.existsSync(dirPath)) {
    console.log('Repository already initialized here.');
    return;
  }
  
  fs.mkdirSync(dirPath);
  fs.writeFileSync(path.join(dirPath, 'config.json'), JSON.stringify({ repoId }, null, 2));
  console.log(`Initialized empty DevCollab repository locally linked to repo ID: ${repoId}`);
};

module.exports = { initRepo };
