export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const apiKey = process.env.HF_API_KEY;
  const { inputs } = req.body;
  const prompt =
    "1. return the title of the article in sentence case prefixed by 'Title', also capitalizing the first letter of every word which follows a colon. 2. return a one-sentence summary of the article prefixed by 'Summary'. 3. return the cleaned input html, with all headings converted to sentence case";

  const response = await fetch(
    "https://router.huggingface.co/novita/v3/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: prompt + inputs }],
        max_tokens: 2048,
      }),
    }
  );

  const result = await response.json();
  res.status(200).json(result);
}
