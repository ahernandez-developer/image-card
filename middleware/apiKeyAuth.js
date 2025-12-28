import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;

export function apiKeyAuth(req, res, next) {
  let apiKey = req.headers['x-api-key'];

  if (apiKey && apiKey.startsWith('API_KEY=')) {
    apiKey = apiKey.substring(8);
  }

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  next();
}
