const API_BASE = "http://localhost:5000/admin"; // backend base
const token = localStorage.getItem("token");

// ====== NEWS ======
const newsForm = document.getElementById("newsForm");
const newsList = document.getElementById("newsList");

async function loadNews() {
  const res = await fetch(`${API_BASE}/news`);
  const data = await res.json();
  newsList.innerHTML = "";
  data.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${item.title}</strong>: ${item.content}</span>
      <div>
        <button class="edit-btn" onclick="editNews(${item.id}, '${item.title}', '${item.content}')">Edit</button>
        <button class="delete-btn" onclick="deleteNews(${item.id})">Delete</button>
      </div>
    `;
    newsList.appendChild(li);
  });
}

newsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("newsTitle").value;
  const content = document.getElementById("newsContent").value;

  await fetch(`${API_BASE}/news`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  newsForm.reset();
  loadNews();
});

async function deleteNews(id) {
  await fetch(`${API_BASE}/news/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadNews();
}

function editNews(id, oldTitle, oldContent) {
  const newTitle = prompt("Edit Title:", oldTitle);
  const newContent = prompt("Edit Content:", oldContent);
  if (!newTitle || !newContent) return;
  fetch(`${API_BASE}/news/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: newTitle, content: newContent }),
  }).then(() => loadNews());
}

// ====== RESOURCES ======
const resourceForm = document.getElementById("resourceForm");
const resourceList = document.getElementById("resourceList");

async function loadResources() {
  const res = await fetch(`${API_BASE}/resources`);
  const data = await res.json();
  resourceList.innerHTML = "";
  data.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${item.title}</strong>: <a href="${item.link}" target="_blank">${item.link}</a></span>
      <div>
        <button class="edit-btn" onclick="editResource(${item.id}, '${item.title}', '${item.link}')">Edit</button>
        <button class="delete-btn" onclick="deleteResource(${item.id})">Delete</button>
      </div>
    `;
    resourceList.appendChild(li);
  });
}

resourceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("resourceTitle").value;
  const link = document.getElementById("resourceLink").value;

  await fetch(`${API_BASE}/resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, link }),
  });

  resourceForm.reset();
  loadResources();
});

async function deleteResource(id) {
  await fetch(`${API_BASE}/resources/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadResources();
}

function editResource(id, oldTitle, oldLink) {
  const newTitle = prompt("Edit Title:", oldTitle);
  const newLink = prompt("Edit Link:", oldLink);
  if (!newTitle || !newLink) return;
  fetch(`${API_BASE}/resources/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: newTitle, link: newLink }),
  }).then(() => loadResources());
}

// ====== INIT ======
loadNews();
loadResources();

// ====== LOGOUT ======
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});
