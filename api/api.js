const axios = require('axios');

module.exports = async function handler(req, res) {
  // CORS
  const allowedHeaders = 'Content-Type, Authorization, X-Requested-With, Accept, platform, channel, app_version';
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload = req.body || {};
  const { path, method, headers, body } = payload;
  const BASE_URL = 'https://api.twistmena.com';

  // Basic validation: require relative path starting with '/'
  if (!path || typeof path !== 'string' || !path.startsWith('/')) {
    return res.status(400).json({ error: 'Invalid path. Provide a relative path starting with /' });
  }

  try {
    const response = await axios({
      url: `${BASE_URL}${path}`,
      method: method || 'GET',
      headers: {
        ...headers,
        Host: 'api.twistmena.com',
        Origin: 'https://api.twistmena.com',
        Referer: 'https://api.twistmena.com/',
        'User-Agent': 'Twist-Mobile/11.1.1 (Android; 15; SM-A057F; music; ar-US)',
        platform: 'android',
        channel: 'mobileapp',
        app_version: '11.1.1',
        appversion: '11.1.1',
        Accept: 'application/json',
        'Accept-Language': 'ar'
      },
      data: body,
      validateStatus: () => true,
      responseType: 'arraybuffer'
    });

    // Forward important response headers (e.g., Content-Type)
    const contentType = response.headers['content-type'];
    if (contentType) res.setHeader('Content-Type', contentType);

    // Send the proxied response body (works for JSON and binary)
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
