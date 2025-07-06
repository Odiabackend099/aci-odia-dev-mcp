export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
  const CALLBACK_URL = 'https://odia.dev/api/webhook/flutterwave';
  const axios = require('axios');

  const payload = {
    tx_ref: `ODIA-${Date.now()}`,
    amount: 900,
    currency: 'NGN',
    redirect_url: CALLBACK_URL,
    customer: {
      email: 'test@odia.dev',
      name: 'ODIA Test Client',
    },
    customizations: {
      title: 'ODIA AI Trial Payment',
      description: 'Pay ₦900 to activate trial AI agent onboarding',
    },
  };

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'success') {
      return res.status(200).json({ link: response.data.data.link });
    } else {
      return res.status(400).json({ error: 'Flutterwave failed', details: response.data });
    }
  } catch (err) {
    console.error('Payment link error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
