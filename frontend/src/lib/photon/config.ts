// Photon API Configuration
// Server-side only - do not import in client components

export const PHOTON_CONFIG = {
  API_KEY: process.env.PHOTON_API_KEY || '',
  CAMPAIGN_ID: process.env.PHOTON_CAMPAIGN_ID || '',
  BASE_URL: process.env.PHOTON_BASE_URL || 'https://stage-api.getstan.app/identity-service/api/v1',
};

export const PHOTON_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-Key': PHOTON_CONFIG.API_KEY,
};
