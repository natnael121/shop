// Get webhook information
const BOT_TOKEN = '7141155447:AAGU2K74kX3ICzSIPB566tly3LUDo423JrU';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getWebhookInfo`);
    const result = await response.json();
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting webhook info:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}