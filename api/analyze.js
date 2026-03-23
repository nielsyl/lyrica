export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const prompt = `You are a world-class music historian, lyric analyst, and cultural critic. Give an extremely detailed, rich, and insightful analysis of this song: "${query}"

Respond ONLY with valid JSON, no markdown, no backticks, no extra text. Use this exact structure:

{
  "title": "Song Title",
  "artist": "Artist Name",
  "year": "Release year",
  "emoji": "A single emoji that represents the song's vibe",
  "genre": "Primary genre",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "story": "4-5 sentences describing in rich detail what the song is literally about.",
  "themes": "4-5 sentences exploring the deeper themes, symbolism, and what the song really means.",
  "lyrics_breakdown": "4-5 sentences explaining the most important lyrics and what they truly mean.",
  "artist_background": "3-4 sentences about the artist, their background, and what inspired this song.",
  "historical_context": "3-4 sentences about the era and context in which this song was made.",
  "legacy": "3-4 sentences on the song's cultural impact and why it still resonates today.",
  "funFacts": [
    "An interesting or surprising fact about this song",
    "Another fun or little-known fact",
    "A third fascinating fact about the song or artist"
  ],
  "moods": [
    {"name": "Melancholy", "value": 75},
    {"name": "Empowerment", "value": 40},
    {"name": "Nostalgia", "value": 60},
    {"name": "Rebellion", "value": 30}
  ],
  "keyLines": [
    "The most iconic lyric from the song",
    "Another deeply meaningful lyric",
    "A third powerful lyric"
  ]
}

Pick 4 moods most relevant to this specific song with values between 0-100. Be as detailed and insightful as possible.`;

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
      max_tokens: 2000,
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
