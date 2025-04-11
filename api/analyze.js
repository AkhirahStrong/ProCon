export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const IP_LIMIT = 10;
  const ipUsage = {};

  function checkIpLimit(ip) {
    const today = new Date().toDateString();

    if (!ipUsage[ip] || ipUsage[ip].lastReset !== today) {
      ipUsage[ip] = { count: 1, lastReset: today };
      return true;
    }

    if (ipUsage[ip].count < IP_LIMIT) {
      ipUsage[ip].count++;
      return true;
    }

    return false;
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!checkIpLimit(ip)) {
    return res.status(429).json({ error: "Daily limit reached for this IP." });
  }

  try {
    const { selectedText } = req.body;

    if (!selectedText) {
      return res.status(400).json({ error: "Missing selected text." });
    }

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
