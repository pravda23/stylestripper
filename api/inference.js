export default async function handler(req, res) {
  const { inputs } = req.body;
  const apiKey = process.env.HF_API_KEY;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/gpt2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs }),
    }
  );

  const result = await response.json();
  res.status(200).json(result);
}
