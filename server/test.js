const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

(async () => {
  try {
    console.log('1. Registering test user...');
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username: 'tester1',
        email: 'tester1@example.com',
        password: 'password123'
      });
      console.log('User registered.');
    } catch (e) {
      if (e.response && e.response.data.message === 'User already exists') {
        console.log('User already exists, continuing...');
      } else {
        throw e;
      }
    }

    console.log('\n2. Logging in via CLI...');
    execSync('dev login -e tester1@example.com -p password123', { stdio: 'inherit' });

    console.log('\n3. Creating repository via CLI...');
    const repoOutput = execSync('dev repo create test-repo-e2e').toString();
    console.log(repoOutput);
    
    const match = repoOutput.match(/ID: ([a-fA-F0-9]{24})/);
    if (!match) throw new Error('Could not parse repo ID');
    const repoId = match[1];

    console.log('\n4. Creating dummy project...');
    const dummyPath = path.join('f:/Mern Dev', 'dummy-project');
    fs.ensureDirSync(dummyPath);
    fs.writeFileSync(path.join(dummyPath, 'index.js'), 'console.log("Hello world!");');
    fs.writeFileSync(path.join(dummyPath, 'readme.md'), '# Dummy Project');
    console.log('Dummy project created at', dummyPath);

    console.log('\n5. Init and Push...');
    execSync(`dev init ${repoId}`, { cwd: dummyPath, stdio: 'inherit' });
    execSync('dev push -m "First automated push!"', { cwd: dummyPath, stdio: 'inherit' });

    console.log('\n6. Verifying Server Uploads...');
    const uploadsPath = path.join('f:/Mern Dev/DevCollab/server/uploads', repoId);
    if (fs.existsSync(uploadsPath)) {
      console.log('Uploads folder exists!');
      const commitDirs = fs.readdirSync(uploadsPath);
      console.log('Commits found:', commitDirs);
      const commitPath = path.join(uploadsPath, commitDirs[0]);
      console.log('Files successfully extracted inside commit:', fs.readdirSync(commitPath));
    } else {
      console.log('Uploads folder missing!');
    }
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
})();
