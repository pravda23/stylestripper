import prompts from "./prompts.js";
import { clickDropZone, highlightDragOver, autoResize } from "./utils/utils.js";
import * as pdfjsLib from "https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.mjs";

// Set worker source to a CDN as well
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs";

document.addEventListener("DOMContentLoaded", () => {
  clickDropZone();
  highlightDragOver();
});

let uploadedHtml = "";

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(prompts).forEach((key) => {
    const btn = document.getElementById(key);
    if (btn) {
      btn.addEventListener("click", () => {
        runInference(prompts[key]);
      });
    }
  });
});

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
  const inputDiv = document.getElementById("previewArea");
  let input = inputDiv.innerHTML;
  if (!/<[a-z][\s\S]*>/i.test(input)) {
    input = inputDiv.innerText;
  }
  let html = uploadedHtml || input;
  const output = stripHtmlStyling(html);
  document.getElementById("outputHtml").value = output;
  autoResize(); // resize the output box
}

// Run cleaner on drag/upload
document
  .getElementById("fileInput")
  .addEventListener("change", async function (e) {
    clearError();
    const file = e.target.files[0];
    if (!file) return;
    const fileType = file.type;

    try {
      if (file.name.endsWith(".docx")) {
        // DOCX handling
        const arrayBuffer = await file.arrayBuffer();
        const resultObject = await mammoth.convertToHtml({ arrayBuffer });
        uploadedHtml = resultObject.value;

        // Remove images before previewing
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = uploadedHtml;
        tempDiv.querySelectorAll("img").forEach((img) => img.remove());
        uploadedHtml = tempDiv.innerHTML;
        document.getElementById("previewArea").innerHTML = uploadedHtml;
        runCleaner();
      } else if (file.name.endsWith(".pdf")) {
        // PDF handling
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          textContent += strings.join(" ") + "\n\n";
        }

        // Wrap text in simple HTML for consistency
        uploadedHtml = `<p>${textContent.replace(/\n/g, "<br>")}</p>`;
        document.getElementById("previewArea").innerHTML = uploadedHtml;
        runCleaner();
      } else {
        showError("Unsupported file type. Please upload a .docx or .pdf file.");
      }
    } catch (err) {
      console.error(err);
      showError("Failed to process file: " + err.message);
    }
  });

// Run cleaner on paste
document.getElementById("previewArea").addEventListener("input", function () {
  clearError();
  uploadedHtml = ""; // Reset uploadedHtml if user edits/pastes
  document
    .getElementById("previewArea")
    .querySelectorAll("img")
    .forEach((img) => img.remove());
  runCleaner();
});

// Reset uploadedHtml if user edits/pastes
document.getElementById("previewArea").addEventListener("paste", function () {
  clearError();
  uploadedHtml = "";
  setTimeout(() => {
    document
      .getElementById("previewArea")
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
async function runInference(prompt) {
  const input = document.getElementById("outputHtml").value;
  const output = document.getElementById("output");
  output.textContent = "Loading...";

  try {
    const res = await fetch("/api/inference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: input, prompt: prompt }),
    });
    // console.log("Sending to inference:", { prompt, input });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log(data);

    // Get the raw model output

    const rawText = data.choices?.[0]?.message?.content || "No response";

    // Strip markdown syntax (basic)
    const cleanText = rawText
      .replace(/[*_~`#>]+/g, "") // Remove *, _, ~, `, #, > etc.
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove markdown links
      .replace(/\\n/g, "\n\n"); // Convert literal \n to newlines

    // Clear previous output
    output.innerHTML = "";

    // Create preformatted block
    const pre = document.createElement("pre");
    pre.textContent = cleanText;
    pre.style.whiteSpace = "pre-wrap";
    pre.style.background = "#1e1e1e";
    pre.style.color = "#e0e0e0";
    pre.style.padding = "10px";
    pre.style.border = "1px solid #ccc";
    pre.style.borderRadius = "4px";
    pre.style.fontFamily = "monospace";
    pre.textContent = cleanText;

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.style.marginTop = "10px";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(cleanText).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
      });
    };

    output.appendChild(pre);
    output.appendChild(copyBtn);
  } catch (err) {
    console.error("Inference error:", err);
    output.textContent = "Failed to get response from model. Check server/API.";
  }
}

// add runInference to the global scope so it can be called from HTML
window.runInference = runInference;
