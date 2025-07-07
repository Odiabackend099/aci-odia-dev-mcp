// backend/api/payment/create.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { amount, email, name, redirect_url } = req.body;

    // ✅ Check for required fields
    if (!amount || !email || !name || !redirect_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ Secure HTTPS request to Flutterwave
    const flutterwaveRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
      },
      body: JSON.stringify({
        tx_ref: `ODIA-${Date.now()}`,
        amount,
        currency: "NGN",
        redirect_url,
        customer: {
          email,
          name
        },
        customizations: {
          title: "ODIA Voice AI",
          description: "Voice Agent Subscription",
          logo: "https://odia.dev/logo.png"
        }
      })
    });

    const data = await flutterwaveRes.json();

    if (!data.status || data.status !== "success") {
      return res.status(500).json({ error: data.message || "Flutterwave error" });
    }

    // ✅ Return payment link to frontend
    return res.status(200).json({ link: data.data.link });

  } catch (err) {
    console.error("❌ Flutterwave error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
