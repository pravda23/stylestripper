export function clickDropZone() {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");

  dropZone.addEventListener("click", () => {
    fileInput.click();
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      const event = new Event("change", { bubbles: true });
      fileInput.dispatchEvent(event);
    }
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("dragover");
  });
}

export function highlightDragOver() {
  const dropZone = document.getElementById("dropZone");
  dropZone.addEventListener("dragover", () => {
    dropZone.classList.add("highlight");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("highlight");
  });

  dropZone.addEventListener("drop", () => {
    dropZone.classList.remove("highlight");
  });
}
