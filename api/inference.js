export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const apiKey = process.env.HF_API_KEY;
  const { inputs, prompt } = req.body;

  console.log("Inference request:", prompt, inputs);

  if (!prompt) {
    console.error("Missing promp");
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
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
          messages: [{ role: "user", content: prompt + " " + inputs }],
          max_tokens: 2048,
        }),
      }
    );

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Inference failed" });
  }
}
