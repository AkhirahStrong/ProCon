import { supabase } from '../lib/supabase';

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const IP_LIMIT = 10;

  // ---------- GET USER IP ----------
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  // ---------- CHECK IP LIMIT (with Supabase) ----------
  async function checkIpLimit(ip) {
    const today = new Date().toDateString();

    const { data, error } = await supabase
      .from('ip_limit')
      .select('*')
      .eq('ip', ip)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Supabase Error:", error);
      return false;
    }

    if (!data) {
      await supabase.from('ip_limit').insert([{ ip, count: 1, last_reset: today }]);
      return true;
    }

    if (data.last_reset !== today) {
      await supabase.from('ip_limit')
        .update({ count: 1, last_reset: today })
        .eq('ip', ip);
      return true;
    }

    if (data.count < IP_LIMIT) {
      await supabase.from('ip_limit')
        .update({ count: data.count + 1 })
        .eq('ip', ip);
      return true;
    }

    return false;
  }

  const allowed = await checkIpLimit(ip);

  if (!allowed) {
    return res.status(429).json({ error: "IP daily limit reached." });
  }

  // ---------- CHECK USER INPUT ----------
  const { selectedText } = req.body;

  if (!selectedText) {
    return res.status(400).json({ error: "Missing selected text." });
  }

  // ---------- CALL OPENAI ----------
  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a privacy policy analyst. Break down privacy agreements into clear pros, cons, and red flags using bullet points or headers. Be detailed and unbiased."
          },
          {
            role: "user",
            content: selectedText
          }
        ]
      })
    });

    const data = await openaiRes.json();

    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ summary: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "No response from OpenAI." });
    }

  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
