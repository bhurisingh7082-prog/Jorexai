import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key || !secret) {
      return res.status(500).json({ error: "Payment system is not configured yet." });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    const { amount, plan } = body;
    // mock order ID
    const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;
    res.status(200).json({ id: orderId, amount: amount * 100, currency: "INR", plan });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
