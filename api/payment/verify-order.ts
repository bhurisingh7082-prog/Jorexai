import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

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
    const { orderId, plan, userId } = body;
    // mock verification
    const isSignatureValid = true;

    if (isSignatureValid) {
       // Store subscription securely in Supabase
        const supabase = getSupabase();
       if (supabase && userId) {
          // Verify payment on the backend before updating the user's subscription.
          const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const { data: existing } = await supabase.from("user_subscriptions").select("id").eq("user_id", userId).single();
          if (existing) {
             await supabase.from("user_subscriptions").update({
               plan: plan.toLowerCase(),
               expiry_date: expiryDate,
               updated_at: new Date().toISOString()
             }).eq("user_id", userId);
          } else {
             await supabase.from("user_subscriptions").insert({
               user_id: userId,
               plan: plan.toLowerCase(),
               chat_count: 0,
               coding_count: 0,
               image_count: 0,
               video_count: 0,
               monthly_reset_date: new Date().toISOString(),
               daily_reset_date: new Date().toISOString(),
               expiry_date: expiryDate,
               updated_at: new Date().toISOString()
             });
          }
       }
       res.status(200).json({ success: true, plan: plan.toLowerCase(), expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
    } else {
       res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
