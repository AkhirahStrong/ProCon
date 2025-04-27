// Handle POST requests to /analyze route
app.post("/analyze", async (req, res) => {

  // const { selectedText, email } = req.body;

  if (!selectedText ) { // ❌ this line blocks guests
    return res.status(400).json({ error: "Missing selectedText or email" });
  }

  // Log to Replit console when this route is hit
  console.log("🔥 HIT /analyze route");

  // Get selected text sent from Chrome Extension
  const { selectedText, email } = req.body;

  if (!selectedText) {
    return res.status(400).json({ error: "Missing selectedText" });
  }

  // Log the received text (good for debugging)
  console.log("📄 Selected Text Received:", selectedText);

  // If no text is provided, return a 400 error
  if (!selectedText) {
    console.log("⚠️ No text received.");
    return res.status(400).json({ error: "Missing selected text." });
  }

  // Check for userpro users
  const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (await isProUser(userIp)) {
    console.log("💎 Pro user — skipping limit");
  } else {
    const allowed = await checkIpLimit(userIp);
    if (!allowed) {
      return res.status(429).json({ error: "🚫 IP daily limit reached." });
    }
  }


  try {
    // Send request to OpenAI's GPT-4o API to analyze the selected text
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,  // Your OpenAI key from .env
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o", // Specific GPT model to use
          messages: [
            {
              role: "system",  // Tells GPT how to behave
              content:
                "You are a privacy policy analyst. Break down privacy agreements into clear pros, cons, and red flags using bullet points or headers. Be detailed and unbiased.",
            },
            {
              role: "user",  // The user's selected text from the web page
              content: selectedText,
            },
          ],
        }),
      },
    );

    // Wait for OpenAI response and parse it to JSON
    const data = await openaiRes.json();

    // Log the full OpenAI response (very useful for debugging)
    console.log("🧠 OpenAI API Response:", data);

    // If GPT returned a summary → send it back to Chrome Extension
    if (data.choices?.[0]?.message?.content) {
      res.json({ summary: data.choices[0].message.content });
    } else {
      // If GPT response failed but didn't throw an error
      res.status(500).json({ error: "OpenAI response failed.", data });
    }

  } catch (err) {
    // Catch any real errors (API down, network error, invalid key, etc)
    console.error("❌ OpenAI Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
