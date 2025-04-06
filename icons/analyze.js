// vercel/api/analyze.js

export default async function handler(req, res) {
    const { selectedText } = req.body;
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You're a privacy agreement analyst. Summarize the text with pros, cons, and potential red flags."
          },
          {
            role: "user",
            content: selectedText
          }
        ]
      })
    });
  
    const data = await response.json();
    res.status(200).json({ summary: data.choices[0].message.content });
  }
  