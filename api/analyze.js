export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const prompt = `You are a passionate music journalist and cultural critic — think Rolling Stone meets Reddit's music community. You write about songs the way a true fan would: with fire, depth, and zero filler. No robotic repetition, no starting every sentence with the song title.

Analyze this song: "${query}"

Rules for your writing:
- Write like a human who LOVES music, not an AI doing a book report
- Never start consecutive sentences the same way
- No phrases like "The song explores..." or "The artist uses..." over and over
- Be specific — mention real details, real emotions, real cultural context
- Be direct and punchy — cut the fluff
- If you don't know the song well, be honest but still insightful

Respond ONLY with valid JSON, no markdown, no backticks. Use this exact structure:

{
  "title": "Song Title",
  "artist": "Artist Name",
  "year": "Release year",
  "emoji": "Single emoji that captures the vibe",
  "genre": "Primary genre",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "story": "Tell the story of this song like you're explaining it to a friend over coffee. What's actually happening? Who is the narrator, what are they going through, what moment in life does this capture? 3-4 sentences, zero fluff.",
  "themes": "Go deep. What is this song REALLY about under the surface? What human truth does it hit? What makes it connect with people on a gut level? Avoid generic statements — be specific and bold. 3-4 sentences.",
  "lyrics_breakdown": "Pick 2-3 specific lines from the actual lyrics and break them down. Quote them, then explain what they really mean — the wordplay, the double meanings, the emotions packed into those words. Make it feel like a revelation. 4-5 sentences.",
  "artist_background": "Who is this artist really? What were they going through when they made this? What makes their perspective unique? Connect their life story to this specific song. 3-4 sentences.",
  "historical_context": "Paint the picture of when this song dropped. What was going on in the world, in music, in culture? Why did this land the way it did at that specific moment? 3-4 sentences.",
  "legacy": "What did this song leave behind? How did it change things — for the artist, for the genre, for listeners? Why do people still come back to it? Be specific. 3-4 sentences.",
  "funFacts": [
    "A genuinely surprising or little-known fact — not something obvious",
    "Something about the making of the song, a hidden detail, or a wild coincidence",
    "A fact that changes how you hear the song once you know it"
  ],
  "moods": [
    {"name": "MoodName", "value": 0},
    {"name": "MoodName", "value": 0},
    {"name": "MoodName", "value": 0},
    {"name": "MoodName", "value": 0}
  ],
  "keyLines": [
    "Most iconic or emotionally devastating line from the song",
    "A line that hits different once you understand the context",
    "A line that perfectly captures the song's soul"
  ]
}

Pick 4 moods that feel true to this specific song, values 0-100. Make every word count.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
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
