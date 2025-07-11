import { clickDropZone, highlightDragOver } from "./utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  clickDropZone();
  highlightDragOver();
});

let uploadedHtml = "";

function showError(msg) {
  if (msg) console.error(msg);
  const errorDiv = document.getElementById("errorMsg");
  errorDiv.textContent = "An unknown error occurred";
  errorDiv.style.display = "block";
}
function clearError() {
  const errorDiv = document.getElementById("errorMsg");
  errorDiv.textContent = "";
  errorDiv.style.display = "none";
}
async function runCleaner() {
  clearError();
  const inputDiv = document.getElementById("inputArea");
  let input = inputDiv.innerHTML;
  if (!/<[a-z][\s\S]*>/i.test(input)) {
    input = inputDiv.innerText;
  }
  let html = uploadedHtml || input;
  const output = stripHtmlStyling(html);
  document.getElementById("outputHtml").value = output;
}

// Run cleaner on drag/upload
document
  .getElementById("fileInput")
  .addEventListener("change", async function (e) {
    clearError();
    const file = e.target.files[0];
    if (!file) return;
    const fileType = file.type;

    if (file.name.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        mammoth
          .convertToHtml({ arrayBuffer: arrayBuffer })
          .then(function (resultObject) {
            uploadedHtml = resultObject.value;
            // Remove images from the preview before displaying
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = uploadedHtml;
            tempDiv.querySelectorAll("img").forEach((img) => img.remove());
            uploadedHtml = tempDiv.innerHTML;
            document.getElementById("inputArea").innerHTML = uploadedHtml;
            runCleaner();
          })
          .catch(function (err) {
            showError(err);
          });
      } catch (err) {
        showError(err);
      }
    } else {
      showError("Unsupported file type. Please upload a .docx file.");
    }
  });

// Run cleaner on paste
document.getElementById("inputArea").addEventListener("input", function () {
  clearError();
  uploadedHtml = ""; // Reset uploadedHtml if user edits/pastes
  document
    .getElementById("inputArea")
    .querySelectorAll("img")
    .forEach((img) => img.remove());
  runCleaner();
});

// Reset uploadedHtml if user edits/pastes
document.getElementById("inputArea").addEventListener("paste", function () {
  clearError();
  uploadedHtml = "";
  setTimeout(() => {
    document
      .getElementById("inputArea")
      .querySelectorAll("img")
      .forEach((img) => img.remove());
    runCleaner();
  }, 0);
});

// Remove all HTML tags except <a>
function stripHtmlStyling(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.body.querySelectorAll("img").forEach((img) => img.remove());
  doc.body.querySelectorAll("*").forEach((el) => {
    if (el.tagName.toLowerCase() === "a") {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== "href") {
          el.removeAttribute(attr.name);
        }
      });
    } else {
      while (el.attributes.length > 0) {
        el.removeAttribute(el.attributes[0].name);
      }
    }
  });

  doc.body.querySelectorAll("div").forEach((div) => {
    while (div.firstChild) {
      div.parentNode.insertBefore(div.firstChild, div);
    }
    div.parentNode.removeChild(div);
  });

  doc.body.querySelectorAll("span").forEach((span) => {
    while (span.firstChild) {
      span.parentNode.insertBefore(span.firstChild, span);
    }
    span.parentNode.removeChild(span);
  });

  return doc.body.innerHTML;
}

// Run inference on button click
async function runInference() {
  const input = document.getElementById("outputHtml").value;
  const output = document.getElementById("output");
  output.textContent = "Loading...";
  const apiKey = process.env.HF_API_KEY;

  try {
    const res = await fetch(
      "https://router.huggingface.co/novita/v3/openai/chat/completions",
      {
        method: "POST",
        headers: {
          // Authorization: `Bearer ${apiKey}`,
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content:
                "return the first 10 words from this article only, with no explainer text: " +
                input,
            },
          ],
          max_tokens: 4096,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log(data.choices[0].message.content);
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("Inference error:", err);
    output.textContent = "Failed to get response from model. Check server/API.";
  }
}

// add runInference to the global scope so it can be called from HTML
window.runInference = runInference;
