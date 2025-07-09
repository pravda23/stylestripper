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

// Run cleaner on input or paste in the input area
document.getElementById("inputArea").addEventListener("input", function () {
  clearError();
  uploadedHtml = ""; // Reset uploadedHtml if user edits/pastes
  document
    .getElementById("inputArea")
    .querySelectorAll("img")
    .forEach((img) => img.remove());
  runCleaner();
});
document.getElementById("inputArea").addEventListener("paste", function () {
  clearError();
  uploadedHtml = ""; // Reset uploadedHtml if user edits/pastes
  setTimeout(() => {
    document
      .getElementById("inputArea")
      .querySelectorAll("img")
      .forEach((img) => img.remove());
    runCleaner();
  }, 0);
});

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

async function runInference() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");
  output.textContent = "Loading...";

  const res = await fetch("/api/inference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: input }),
  });

  const data = await res.json();
  output.textContent = JSON.stringify(data, null, 2);
}

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

// Click drop zone to open file dialog
dropZone.addEventListener("click", () => fileInput.click());

// Highlight on drag over
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    // Trigger the file input change event to process the file
    fileInput.dispatchEvent(new Event("change"));
  }
});

// run inference on button click

async function runInference() {
  const input = document.getElementById("output").value;
  const output = document.getElementById("output");
  output.textContent = "Loading...";

  try {
    const res = await fetch("/api/inference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: "Convert this news headline into sentence case: Man Bites Dog",
      }),
    });

    if (!res.ok) {
      const errText = await res.text(); // Try to get any error message
      throw new Error(`Server error (${res.status}): ${errText}`);
    }

    const data = await res.json(); // This will now only run if content exists
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("Inference error:", err);
    output.textContent = "Failed to get response from model. Check server/API.";
  }
}
