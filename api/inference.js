export default async function handler(req, res) {
  const { inputs } = req.body;
  const apiKey = process.env.HF_API_KEY;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/meta-llama/Llama-4-Scout-17B-16E-Instruct",
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
  console.log(result);
  res.status(200).json(result);
}
