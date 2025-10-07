const BASE_URL = "http://localhost:5000"; // Backend URL - Ensure this matches your backend port

// ==========================
// UI INTERACTIONS (From Your Original Code - Unchanged)
// ==========================

// Desktop Dropdown Click Toggle
document.querySelectorAll('.dropdown-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const menu = btn.nextElementSibling;

    // Close other open dropdowns
    document.querySelectorAll('.dropdown-btn').forEach(otherBtn => {
      if (otherBtn !== btn) {
        const otherMenu = otherBtn.nextElementSibling;
        otherMenu.classList.add('hidden');
      }
    });

    menu.classList.toggle('hidden');
  });
});

// Close dropdown if clicked outside
window.addEventListener('click', (e) => {
  if (!e.target.matches('.dropdown-btn')) {
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
      btn.nextElementSibling.classList.add('hidden');
    });
  }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// Dark Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;

if (themeToggle) {
  // Load saved mode from localStorage
  if (localStorage.getItem("theme") === "dark") {
    htmlElement.classList.add("dark");
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }

  themeToggle.addEventListener("click", () => {
    if (htmlElement.classList.contains("dark")) {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙";
    } else {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️";
    }
  });
}

// ================== HELPER FUNCTIONS (For Token and Role Checks) ==================
function getToken() {
  return localStorage.getItem("token");
}

function isAdmin() {
  return localStorage.getItem("role") === "admin" && getToken();
}

// ================== AUTH FUNCTIONS (Connect to Backend /auth Routes) ==================

// ===== LOGIN FUNCTION =====
async function login(event) {
  event.preventDefault();

  const role = document.querySelector("#roleSelect").value;
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();
    console.log("Login Response:", data); // Debug: Check browser console (F12)

    if (!response.ok) {
      alert(data.message || `Login failed! Status: ${response.status}`);
      return;
    }

    // Save token and role locally
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", role);

    alert("Login successful!");

    // Redirect based on role
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "student") {
      window.location.href = "student.html";
    } else { // alumni
      window.location.href = "alumni.html";
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert(`Network error: ${err.message}. Is the backend running on ${BASE_URL}?`);
  }
}

// ===== REGISTER FUNCTION ===== (Uses "username" to match backend)
async function registerUser (event) {
  event.preventDefault();

  const role = document.querySelector("#roleSelect").value;
  const username = document.querySelector("#username").value.trim(); // Backend expects "username"
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!username || !email || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }), // Backend expects "username"
    });

    const data = await response.json();
    console.log("Register Response:", data); // Debug: Check browser console (F12)

    if (!response.ok) {
      alert(data.message || `Registration failed! Status: ${response.status}`);
      return;
    }

    alert("Registration successful! Please login now.");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Registration Error:", err);
    alert(`Network error: ${err.message}. Is the backend running on ${BASE_URL}?`);
  }
}

// ================== HOMEPAGE FUNCTIONS (Public - No Token Needed for index.html) ==================

async function loadHomepageNews() {
  try {
    const res = await fetch(`${BASE_URL}/admin/news`); // Public endpoint (no auth required)
    const news = await res.json();
    const container = document.getElementById("newsContainer");
    if (container) {
      container.innerHTML = news.length
        ? news
            .map(
              (n) =>
                `<div class="bg-white dark:bg-gray-800 p-6 rounded shadow hover:shadow-lg transition">
                  <h3 class="text-xl font-semibold mb-2">${n.title}</h3>
                  <p class="text-gray-600 dark:text-gray-300 mb-2">${n.content.substring(0, 100)}...</p>
                  <span class="text-sm text-gray-500 dark:text-gray-400">${new Date(n.created_at).toLocaleDateString()}</span>
                </div>`
            )
            .join("")
        : `<p class="text-gray-600">No news available.</p>`;
    }
  } catch (err) {
    console.error("Load homepage news error:", err);
  }
}

async function loadHomepageResources() {
  try {
    const res = await fetch(`${BASE_URL}/admin/resources`); // Public endpoint (no auth required)
    const resources = await res.json();
    const container = document.getElementById("resourcesContainer");
    if (container) {
      container.innerHTML = resources.length
        ? resources
            .map(
              (r) =>
                `<div class="bg-white dark:bg-gray-800 p-6 rounded shadow hover:shadow-lg transition">
                  <h3 class="text-xl font-semibold mb-3">${r.title}</h3>
                  <p><a href="${r.link}" target="_blank" class="text-blue-600 hover:underline">${r.link}</a></p>
                </div>`
            )
            .join("")
        : `<p class="text-gray-600">No resources available.</p>`;
    }
  } catch (err) {
    console.error("Load homepage resources error:", err);
  }
}

// ================== ADMIN FUNCTIONS (Protected - With Token for admin.html) ==================

// Load users for admin dashboard
async function loadAdminUsers() {
  if (!isAdmin()) {
    alert("Admin access required. Please login as admin.");
    window.location.href = "login.html";
    return;
  }

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { 
        "Authorization": `Bearer ${token}`  // Required for protected route
      },
    });
    const data = await res.json();
    console.log("Admin Users Response:", data); // Debug

    const tableBody = document.getElementById("userTableBody");
    if (tableBody) {
      if (!res.ok) {
        alert(data.message || "Failed to load users.");
        return;
      }
      tableBody.innerHTML = data
        .map(
          (user) => `
          <tr class="border-b">
            <td class="py-2 px-4">${user.id}</td>
            <td class="py-2 px-4">${user.name}</td>
            <td class="py-2 px-4">${user.email}</td>
            <td class="py-2 px-4">${user.role}</td>
          </tr>`
        )
        .join("");
    }
  } catch (err) {
    console.error("Load users error:", err);
    alert("Error loading users. Check token or backend.");
  }
}

// Load news for admin dashboard
async function loadAdminNews() {
  if (!isAdmin()) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/news`, {
      headers: { 
        "Authorization": `Bearer ${token}`  // Required for protected route
      },
    });
    const data = await res.json();
    console.log("Admin News Response:", data); // Debug

    const newsList = document.getElementById("newsList");
    if (newsList && res.ok) {
      newsList.innerHTML = data
        .map(
          (item) => `
            <li class="bg-white p-4 mb-2 rounded shadow">
              <strong>${item.title}</strong>: ${item.content}
              <div class="mt-2">
                <button onclick="editNews(${item.id}, '${item.title.replace(/'/g, "\\'")}', '${item.content.replace(/'/g, "\\'")}')" class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                <button onclick="deleteNews(${item.id})" class="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </li>`
        )
        .join("");
    } else if (!res.ok) {
      alert("Failed to load news.");
    }
  } catch (err) {
    console.error("Load admin news error:", err);
  }
}

// Add news
async function addNews(title, content) {
  if (!isAdmin()) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/news`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Required
      },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    console.log("Add News Response:", data); // Debug

    if (res.ok) {
      loadAdminNews(); // Reload list
      document.getElementById("newsForm")?.reset();
      alert("News added successfully!");
    } else {
      alert(data.message || "Failed to add news.");
    }
  } catch (err) {
    console.error("Add news error:", err);
    alert("Error adding news.");
  }
}

// Delete news
async function deleteNews(id) {
  if (!isAdmin()) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/news/${id}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`  // Required
      },
    });
    const data = await res.json();
    console.log("Delete News Response:", data); // Debug

    if (res.ok) {
      loadAdminNews(); // Reload
      alert("News deleted!");
    } else {
      alert(data.message || "Failed to delete news.");
    }
  } catch (err) {
    console.error("Delete news error:", err);
    alert("Error deleting news.");
  }
}

// Edit news
async function editNews(id, oldTitle, oldContent) {
  if (!isAdmin()) return;

  const newTitle = prompt("Edit Title:", oldTitle);
  const newContent = prompt("Edit Content:", oldContent);
  if (!newTitle || !newContent) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/news/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Required
      },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    });
    const data = await res.json();
    console.log("Edit News Response:", data); // Debug

    if (res.ok) {
      loadAdminNews(); // Reload
      alert("News updated!");
    } else {
      alert(data.message || "Failed to update news.");
    }
  } catch (err) {
    console.error("Edit news error:", err);
    alert("Error updating news.");
  }
}

// Load resources for admin dashboard
async function loadAdminResources() {
  if (!isAdmin()) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/resources`, {
      headers: { 
        "Authorization": `Bearer ${token}`  // Required for protected route
      },
    });
    const data = await res.json();
    console.log("Admin Resources Response:", data); // Debug

    const resourceList = document.getElementById("resourceList");
    if (resourceList && res.ok) {
      resourceList.innerHTML = data
        .map(
          (item) => `
            <li class="bg-white p-4 mb-2 rounded shadow">
              <strong>${item.title}</strong>: <a href="${item.link}" target="_blank">${item.link}</a>
              <div class="mt-2">
                <button onclick="editResource(${item.id}, '${item.title.replace(/'/g, "\\'")}', '${item.link.replace(/'/g, "\\'")}')" class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                <button onclick="deleteResource(${item.id})" class="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </li>`
        )
        .join("");
    } else if (!res.ok) {
      alert("Failed to load resources.");
    }
  } catch (err) {
    console.error("Load admin resources error:", err);
  }
}

// Add resource
async function addResource(title, link) {
  if (!isAdmin()) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/resources`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Required
      },
      body: JSON.stringify({ title, link }),
    });
    const data = await res.json();
    console.log("Add Resource Response:", data); // Debug

    if (res.ok) {
      loadAdminResources(); // Reload
      document.getElementById("resourceForm")?.reset();
      alert("Resource added successfully!");
    } else {
      alert(data.message || "Failed to add resource.");
    }
  } catch (err) {
    console.error("Add resource error:", err);
    alert("Error adding resource.");
  }
}

// Delete resource
async function deleteResource(id) {
  if (!isAdmin()) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/resources/${id}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`  // Required
      },
    });
    const data = await res.json();
    console.log("Delete Resource Response:", data); // Debug

    if (res.ok) {
      loadAdminResources(); // Reload
      alert("Resource deleted!");
    } else {
      alert(data.message || "Failed to delete resource.");
    }
  } catch (err) {
    console.error("Delete resource error:", err);
    alert("Error deleting resource.");
  }
}

// Edit resource (COMPLETED - This was the truncated part)
async function editResource(id, oldTitle, oldLink) {
  if (!isAdmin()) return;

  const newTitle = prompt("Edit Title:", oldTitle);
  const newLink = prompt("Edit Link:", oldLink);
  if (!newTitle || !newLink) return;

  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/resources/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Required for protected route
      },
      body: JSON.stringify({ title: newTitle, link: newLink }),
    });
    const data = await res.json();
    console.log("Edit Resource Response:", data); // Debug

    if (res.ok) {
      loadAdminResources(); // Reload list
      alert("Resource updated!");
    } else {
      alert(data.message || "Failed to update resource.");
    }
  } catch (err) {
    console.error("Edit resource error:", err);
    alert("Error updating resource.");
  }
}

// ================== INITIALIZATION (Load Data on Page Load) ==================
// ================== INITIALIZATION (Load Data on Page Load) ==================
// Auto-load content based on current page
document.addEventListener("DOMContentLoaded", () => {
  // Load homepage data (public - no token needed)
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
    loadHomepageNews();
    loadHomepageResources();
  }

  // Load admin data (protected - check token first)
  if (window.location.pathname.endsWith("admin.html")) {
    // Check if admin is logged in; redirect if not
    if (!isAdmin()) {
      alert("Admin access required. Redirecting to login...");
      window.location.href = "login.html";
      return;
    }

    // Load admin content
    loadAdminUsers();
    loadAdminNews();
    loadAdminResources();

    // Handle form submissions for news (if #newsForm exists in admin.html)
    const newsForm = document.getElementById("newsForm");
    if (newsForm) {
      newsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("newsTitle").value.trim();
        const content = document.getElementById("newsContent").value.trim();
        if (title && content) {
          addNews(title, content);
        } else {
          alert("Please fill title and content!");
        }
      });
    }

    // Handle form submissions for resources (if #resourceForm exists in admin.html)
    const resourceForm = document.getElementById("resourceForm");
    if (resourceForm) {
      resourceForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("resourceTitle").value.trim();
        const link = document.getElementById("resourceLink").value.trim();
        if (title && link) {
          addResource(title, link);
        } else {
          alert("Please fill title and link!");
        }
      });
    }

    // Handle logout button (if #logoutBtn exists in admin.html or other pages)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        alert("Logged out successfully!");
        window.location.href = "login.html";
      });
    }
  }

  // Attach auth form listeners (for login.html and register.html)
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", registerUser );
  }

  // Role select change handler (optional - for dynamic UI)
  const roleSelects = document.querySelectorAll("#roleSelect");
  roleSelects.forEach(select => {
    select.addEventListener("change", (e) => {
      console.log("Role changed to:", e.target.value); // Debug
    });
  });
});

// ================== END OF SCRIPT ==================
// All functions are now defined and ready. No more code below.