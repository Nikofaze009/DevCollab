const axios = require('axios');
const { getConfig } = require('../utils/config');

const API_URL = 'https://devcollab-6oq5.onrender.com/api';

const getClient = () => {
  const config = getConfig();
  if (!config.token) {
    console.error('Error: Not logged in. Run `dev login` first.');
    process.exit(1);
  }
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${config.token}` }
  });
};

const createRepo = async (name, desc = '') => {
  try {
    const api = getClient();
    console.log(`Creating repository '${name}'...`);
    
    const response = await api.post('/repos', {
      repoName: name,
      description: desc,
      visibility: 'public'
    });

    console.log(`\nSuccess! Repository created with ID: ${response.data._id}`);
  } catch (error) {
    console.error(`\nError creating repo: ${error.response?.data?.message || error.message}`);
  }
};

const listRepos = async () => {
  try {
    const api = getClient();
    console.log('Fetching your repositories...\n');
    
    const response = await api.get('/repos');
    
    if (response.data.length === 0) {
      console.log('You do not have any repositories yet.');
    } else {
      response.data.forEach((repo) => {
        console.log(`- ${repo.repoName} (${repo.visibility})`);
        if (repo.description) console.log(`  Description: ${repo.description}`);
      });
    }
  } catch (error) {
    console.error(`\nError fetching repos: ${error.response?.data?.message || error.message}`);
  }
};

const deleteRepo = async (id) => {
  try {
    const api = getClient();
    console.log(`Deleting repository '${id}'...`);
    
    await api.delete(`/repos/${id}`);
    
    console.log(`\nSuccess! Repository deleted.`);
  } catch (error) {
    console.error(`\nError deleting repo: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = { createRepo, listRepos, deleteRepo };
