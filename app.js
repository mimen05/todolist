const STORAGE_KEY = "todo-items-v1";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const imageInput = document.getElementById("image-input");
const fileLabelText = document.getElementById("file-label-text");
const previewWrap = document.getElementById("image-preview-wrap");
const previewImg = document.getElementById("image-preview");
const clearImageBtn = document.getElementById("clear-image");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

let pendingImage = null; // base64 data URL for the task currently being composed

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (err) {
    console.error("Failed to save tasks:", err);
    return false;
  }
}

function render() {
  const tasks = loadTasks(); //calls the earlier function to pull from localStorage
  list.innerHTML = ""; //ul task-list from HTML, .innerHTML wipes everything clean
  emptyState.classList.toggle("hidden", tasks.length > 0); //toggles if the msg is hidden or not (if task is more then 0)

  for (const task of tasks) { //loop to go thru the tasks array, task is named for every current item
    const li = document.createElement("li"); //new list element
    li.className = "task-item" + (task.done ? " done" : ""); 
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));
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

function addTask(text, image) {
  const tasks = loadTasks();
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text,
    image: image || null,
    done: false,
  });
  if (!saveTasks(tasks)) {
    alert("Couldn't save this task — storage is full. Try a smaller image or delete some old tasks.");
    return false;
  }
  render();
  return true;
}

function toggleTask(id) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  saveTasks(tasks);
  render();
}

function deleteTask(id) {
  const tasks = loadTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
  render();
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
      pendingImage = resized; // base64 data URL, downscaled to keep localStorage happy
      previewImg.src = pendingImage;
      previewWrap.classList.remove("hidden");
      fileLabelText.textContent = file.name;
    });
  };
  reader.readAsDataURL(file);
});

clearImageBtn.addEventListener("click", resetImagePicker);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  if (addTask(text, pendingImage)) {
    input.value = "";
    resetImagePicker();
  }
  input.focus();
});

render();
