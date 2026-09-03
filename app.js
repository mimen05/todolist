const API = "/api/tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const imageInput = document.getElementById("image-input");
const fileLabelText = document.getElementById("file-label-text");
const previewWrap = document.getElementById("image-preview-wrap");
const previewImg = document.getElementById("image-preview");
const clearImageBtn = document.getElementById("clear-image");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

let pendingImage = null; // parks the image before the add button is hit, clears after attached image to task

async function loadTasks() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("Failed to load tasks:", err);
    return [];
  }
}

async function render() {
  const tasks = await loadTasks();
  list.innerHTML = "";
  emptyState.classList.toggle("hidden", tasks.length > 0);

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id, !task.done));
    li.appendChild(checkbox);

    if (task.image) {
      const thumb = document.createElement("img");
      thumb.src = task.image;
      thumb.className = "task-thumb";
      thumb.alt = "Task image";
      thumb.title = "Click to view full size";
      thumb.addEventListener("click", () => openImage(task.image));
      li.appendChild(thumb);
    }

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    li.appendChild(text);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "&times;";
    deleteBtn.title = "Delete task";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));
    li.appendChild(deleteBtn);

    list.appendChild(li);
  }
}

async function addTask(text, image) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, image }),
    });
    if (!res.ok) throw new Error(`Server said ${res.status}`);
  } catch (err) {
    console.error("Failed to add task:", err);
    alert("Couldn't save this task. Is the server running?");
    return false;
  }
  await render();
  return true;
}

async function toggleTask(id, done) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (!res.ok) throw new Error(`Server said ${res.status}`);
  } catch (err) {
    console.error("Failed to update task:", err);
  }
  await render();
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Server said ${res.status}`);
  } catch (err) {
    console.error("Failed to delete task:", err);
  }
  await render();
}

function openImage(dataUrl) {
  const win = window.open();
  if (win) {
    win.document.write(
      `<title>Image</title><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#111"><img src="${dataUrl}" style="max-width:100%;max-height:100vh"></body>`
    );
  }
}

function resetImagePicker() {
  pendingImage = null;
  imageInput.value = "";
  previewWrap.classList.add("hidden");
  previewImg.src = "";
  fileLabelText.textContent = "+ Add image";
}

function resizeImage(dataUrl, maxDim) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    resizeImage(reader.result, 800).then((resized) => {
      pendingImage = resized; // base64 data URL, downscaled to keep the request small
      previewImg.src = pendingImage;
      previewWrap.classList.remove("hidden");
      fileLabelText.textContent = file.name;
    });
  };
  reader.readAsDataURL(file);
});

clearImageBtn.addEventListener("click", resetImagePicker);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  if (await addTask(text, pendingImage)) {
    input.value = "";
    resetImagePicker();
  }
  input.focus();
});

render();