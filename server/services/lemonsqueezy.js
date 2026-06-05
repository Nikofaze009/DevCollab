const axios = require('axios');

const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY;

// Variant IDs for plans (from your Lemon Squeezy dashboard)
const VARIANT_IDS = {
  pro:  process.env.LS_PRO_VARIANT_ID  || '1749964',
  team: process.env.LS_TEAM_VARIANT_ID || '1749974',
};

// Axios instance for Lemon Squeezy API
const lsAPI = axios.create({
  baseURL: 'https://api.lemonsqueezy.com/v1',
  headers: {
    Authorization: `Bearer ${LS_API_KEY}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
});

// Auto-fetch store ID if not set in .env
let cachedStoreId = null;
async function getStoreId() {
  if (process.env.LEMONSQUEEZY_STORE_ID) return process.env.LEMONSQUEEZY_STORE_ID;
  if (cachedStoreId) return cachedStoreId;
  const res = await lsAPI.get('/stores');
  cachedStoreId = res.data.data[0].id;
  return cachedStoreId;
}

module.exports = { lsAPI, VARIANT_IDS, getStoreId };
