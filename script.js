function removeMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold **text**
    .replace(/\*(.*?)\*/g, "$1") // italic *text*
    .replace(/\\n/g, "\n"); // literal \n to new line
}

// Run inference on button click
async function runInference() {
  const apiURL =
    location.hostname === "localhost"
      ? "http://localhost:3000/api/inference"
      : "https://stylestripper.vercel.app/api/inference";

  const input = document.getElementById("outputHtml").value;
  const output = document.getElementById("output");
  output.textContent = "Loading...";

  try {
    const res = await fetch(`${apiURL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: input }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log(data);
    const rawText = data.choices[0].message.content;
    const cleanText = removeMarkdown(rawText);

    // Clear output container
    output.innerHTML = "";

    // Create container div
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.marginBottom = "1em";

    // Create pre block to show clean text with formatting
    const pre = document.createElement("pre");
    pre.textContent = cleanText;
    pre.style.whiteSpace = "pre-wrap";
    pre.style.background = "#f9f9f9";
    pre.style.padding = "10px";
    pre.style.border = "1px solid #ccc";
    pre.style.borderRadius = "4px";

    // Create copy button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.style.position = "absolute";
    copyBtn.style.top = "5px";
    copyBtn.style.right = "5px";
    copyBtn.style.padding = "4px 8px";
    copyBtn.style.fontSize = "0.8em";
    copyBtn.style.cursor = "pointer";

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(cleanText).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
      });
    };

    container.appendChild(pre);
    container.appendChild(copyBtn);
    output.appendChild(container);
  } catch (err) {
    console.error("Inference error:", err);
    output.textContent = "Failed to get response from model. Check server/API.";
  }
}

// add runInference to the global scope so it can be called from HTML
window.runInference = runInference;
