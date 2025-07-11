export default async function handler(req, res) {
  const { inputs } = req.body;

  const response = await fetch(
    "https://router.huggingface.co/novita/v3/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content:
              "return the first 10 words from this article only, with no explainer text: " +
              inputs,
          },
        ],
        max_tokens: 512,
      }),
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
