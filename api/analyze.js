export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
      // console.error("Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
  