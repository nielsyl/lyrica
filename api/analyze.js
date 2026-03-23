export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const prompt = `You are a music analysis expert. The user wants to know about this song: "${query}"

Respond ONLY with valid JSON, no markdown, no backticks, no extra text. Use this exact structure:

{
  "title": "Song Title",
  "artist": "Artist Name",
  "year": "Year (if known)",
  "emoji": "A single emoji that represents the song's vibe",
  "genre": "Primary genre",
  "tags": ["tag1", "tag2", "tag3"],
  "story": "2-3 sentences describing what the song is literally about.",
  "themes": "2-3 sentences on the deeper themes and what the song really means.",
  "legacy": "2 sentences on why this song is significant or culturally important.",
  "moods": [
    {"name": "Melancholy", "value": 75},
    {"name": "Empowerment", "value": 40},
    {"name": "Nostalgia", "value": 60},
    {"name": "Rebellion", "value": 30}
  ],
  "keyLines": [
    "A memorable lyric or line from the song",
    "Another significant lyric",
    "A third meaningful lyric"
  ]
}

Pick moods relevant to this specific song with values between 0-100.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return res.status(500).json({ error: data.error.message });
  }

  const text = data.choices?.[0]?.message?.content || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return res.status(500).json({ error: "Could not parse response" });
  }

  return res.status(200).json(JSON.parse(jsonMatch[0]));
}
