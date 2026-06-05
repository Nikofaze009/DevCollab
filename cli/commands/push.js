const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const FormData = require('form-data');
const axios = require('axios');
const { getConfig } = require('../utils/config');

const API_URL = 'https://devcollab-6oq5.onrender.com/api';

const pushRepo = async (message) => {
  const devCollabPath = path.join(process.cwd(), '.devcollab', 'config.json');
  
  if (!fs.existsSync(devCollabPath)) {
    console.error('Error: Not a DevCollab repository. Run `dev init <repoId>` first.');
    process.exit(1);
  }

  const { repoId } = JSON.parse(fs.readFileSync(devCollabPath, 'utf-8'));
  const config = getConfig();

  if (!config.token) {
    console.error('Error: Not logged in. Run `dev login` first.');
    process.exit(1);
  }

  console.log('Compressing files (ignoring node_modules & .git)...');
  
  const zipPath = path.join(process.cwd(), '.devcollab', 'temp_upload.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', async () => {
    console.log(`Zipped ${archive.pointer()} total bytes. Uploading to server...`);
    
    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('code', fs.createReadStream(zipPath));

      const response = await axios.post(`${API_URL}/repos/${repoId}/push`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${config.token}`
        }
      });

      console.log(`\nSuccess! ${response.data.message}`);
      
      // Cleanup local zip
      fs.unlinkSync(zipPath);
    } catch (error) {
      console.error(`\nPush Failed: ${error.response?.data?.message || error.message}`);
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    }
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  
  // Glob pattern to zip everything except ignored folders
  archive.glob('**/*', {
    cwd: process.cwd(),
    ignore: ['**/node_modules/**', '**/.git/**', '**/.devcollab/**']
  });

  archive.finalize();
};

module.exports = { pushRepo };
