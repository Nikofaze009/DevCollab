const axios = require('axios');
const { saveConfig } = require('../utils/config');

const API_URL = 'https://devcollab-6oq5.onrender.com/api';

const login = async (email, password) => {
  try {
    console.log('Authenticating...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    const token = response.data.token;
    saveConfig({ token, user: response.data.username });
    
    console.log(`\nSuccess! Logged in as ${response.data.username}.`);
  } catch (error) {
    if (error.response) {
      console.error(`\nLogin failed: ${error.response.data.message}`);
    } else {
      console.error(`\nError: Could not connect to DevCollab server.`);
    }
  }
};

module.exports = { login };
